import {
  createContext,
  Dispatch,
  FC,
  lazy,
  ReactElement,
  ReactNode,
  SetStateAction,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ImagePlus as AddPhotoIcon,
  Images as AddGalleryIcon,
  Video as AddVideoIcon,
  Music as AddMusicIcon,
  Type as MarksIcon,
  Heading2 as H2Icon,
  Heading3 as H3Icon,
  List as ListIcon,
  ListOrdered as NumberedListIcon,
  Quote as CitationIcon,
  Code as CodeIcon,
} from "lucide-react";
import { EditorState, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { FieldValues, FormProvider, useForm, useFormContext } from "react-hook-form";
import { useDebounce } from "use-debounce";

import { useElementOpen } from "@/RichArticleEditor/hooks/useElementOpen";

import { detailsSummaryNodeView } from "./components/NodeSummary";
import { audioWaveformNodeView } from "./extensions/AudioWaveExtension";
import { imageCarouselNodeView } from "./extensions/CarouselExtension";
import { customImageNodeView } from "./extensions/CustomImageExtension";
import { customVideoNodeView } from "./extensions/CustomVideoExtension";
import { mainImageNodeView } from "./extensions/MainImageExtension";
import { createCallbackPlugin, EditorCallbacks } from "./pm/callbackPlugin";
import * as cmd from "./pm/commands";
import { getMarkRange } from "./pm/commands";
import { buildKeymap } from "./pm/keymap";
import { buildPlugins } from "./pm/plugins";
import { useEditor } from "./pm/react/useEditor";
import { useEditorState } from "./pm/react/useEditorState";
import { editorSchema } from "./pm/schema";
import {
  fileToBase64,
  pinMainBg,
  selectAudioFile,
  selectImageFile,
  selectVideoFile,
} from "./shared/helpers";
import { CarouselItem, RichArticleEditorProps } from "./shared/types";

const CarouselModal = lazy(() => import("./components/CarouselModal"));

// --- Module-level selectors (stable references for useEditorState) ---

const selectIsSelected = (state: EditorState): boolean => {
  if (!(state as EditorState | null)) return false;
  const { selection: sel } = state;
  return (
    sel instanceof TextSelection &&
    !sel.empty &&
    sel.$from.parent.isTextblock &&
    sel.$to.parent.isTextblock &&
    state.doc.textBetween(sel.from, sel.to, " ").trim().length > 0
  );
};

const selectIsContentLength = (state: EditorState): boolean => {
  if (!(state as EditorState | null)) return false;
  return state.doc.textContent.trim().length > 0;
};

// --- Types ---

interface FormValues {
  title: string;
  content: Record<string, unknown>;
}

export interface DropdownItem {
  title: string;
  Icon: () => ReactElement;
  action: () => void;
  disabled?: boolean;
}

// --- EditorInstanceContext (stable after mount) ---

interface EditorInstanceContextType {
  view: EditorView | null;
  mountRef: (node: HTMLElement | null) => void;
}

const EditorInstanceContext = createContext<EditorInstanceContextType>({
  view: null,
  mountRef: () => {},
});

export const useEditorInstance = () => useContext(EditorInstanceContext);

// --- EditorLinkContext (internal, low-frequency toggle) ---

interface EditorLinkContextType {
  isLinkActive: boolean;
  onToggleLinkActive: (force?: boolean) => void;
}

const EditorLinkContext = createContext<EditorLinkContextType>({
  isLinkActive: false,
  onToggleLinkActive: () => {},
});

// --- useEditorSelection (public hook) ---
// Derives isSelected/isContentLength directly from PM state via useSyncExternalStore.
// Only re-renders the calling component when the derived value actually changes.

export function useEditorSelection() {
  const { view } = useEditorInstance();
  const isSelected = useEditorState(view, selectIsSelected);
  const isContentLength = useEditorState(view, selectIsContentLength);
  const { isLinkActive, onToggleLinkActive } = useContext(EditorLinkContext);
  return { isSelected, isContentLength, isLinkActive, onToggleLinkActive };
}

// --- EditorActionsContext (stable references) ---

interface EditorActionsContextType {
  hasMainImage: boolean;
  setHasMainImage: Dispatch<SetStateAction<boolean>>;
  carouselItems: CarouselItem[];
  setCarouselItems: Dispatch<SetStateAction<CarouselItem[]>>;
  editingCarouselPos: number | null;
  setEditingCarouselPos: Dispatch<SetStateAction<number | null>>;
  openCarouselModal: () => void;
  floatingMenuItems: DropdownItem[];
  marksMenuItems: DropdownItem[];
  onSelectImage: () => void;
  onBack?: () => void;
  handlePublish?: () => void;
  onUploadImage?: (file: File) => Promise<string>;
}

const EditorActionsContext = createContext<EditorActionsContextType>({
  hasMainImage: false,
  setHasMainImage: () => {},
  carouselItems: [],
  setCarouselItems: () => {},
  editingCarouselPos: null,
  setEditingCarouselPos: () => {},
  openCarouselModal: () => {},
  floatingMenuItems: [],
  marksMenuItems: [],
  onSelectImage: () => {},
});

export const useEditorActions = () => useContext(EditorActionsContext);

// --- Constants ---

export const SERVER_UPDATE_TIMEOUT = 3000;

// --- TitleAutoSave (isolates title-keystroke re-renders from the provider tree) ---

function TitleAutoSave({
  onSave,
}: {
  onSave?: (data: { title: string; content: Record<string, unknown> }) => void | Promise<void>;
}) {
  const { watch, handleSubmit } = useFormContext<FormValues>();
  const title = watch("title");
  const [debouncedTitle] = useDebounce(title, SERVER_UPDATE_TIMEOUT);

  useEffect(() => {
    if (debouncedTitle.length) {
      handleSubmit(async (values: FieldValues) => {
        await onSave?.({
          title: values.title as string,
          content: values.content as Record<string, unknown>,
        });
      })();
    }
  }, [debouncedTitle, handleSubmit, onSave]);

  return null;
}

// --- LinkProvider (isolates link-active state) ---

function LinkProvider({ children }: { children: ReactNode }) {
  const [isLinkActive, setLinkActive] = useState(false);

  const onToggleLinkActive = (force?: boolean) => {
    setLinkActive((prevState) => (force ? false : !prevState));
  };

  return (
    <EditorLinkContext.Provider value={{ isLinkActive, onToggleLinkActive }}>
      {children}
    </EditorLinkContext.Provider>
  );
}

// --- ActionsProvider (isolates carousel / mainImage / menu state) ---

interface ActionsProviderProps {
  children: ReactNode;
  registerCallbacks: (cbs: EditorCallbacks) => void;
  onBack?: () => void;
  onPublish?: (data: { title: string; content: Record<string, unknown> }) => void;
  onUploadImage?: (file: File) => Promise<string>;
  onUploadVideo?: (file: File) => Promise<string>;
  onUploadAudio?: (file: File) => Promise<string>;
}

function ActionsProvider({
  children,
  registerCallbacks,
  onBack,
  onPublish,
  onUploadImage,
  onUploadVideo,
  onUploadAudio,
}: ActionsProviderProps) {
  const { view } = useEditorInstance();
  const { getValues } = useFormContext<FormValues>();

  const {
    isOpen: isCarouselModalOpen,
    open: onCarouselOpen,
    close: onCarouselClose,
  } = useElementOpen(false);
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [editingCarouselPos, setEditingCarouselPos] = useState<number | null>(null);

  const [hasMainImage, setHasMainImage] = useState(() => {
    if (!view) return false;
    const json = view.state.doc.toJSON() as {
      content?: Array<{ type: string; attrs?: { src?: string } }>;
    };
    return !!json.content?.some((node) => node.type === "mainImage" && node.attrs?.src);
  });

  // Sync callbacks to the parent-owned ref via registration function
  useEffect(() => {
    registerCallbacks({
      onUploadImage,
      setHasMainImage,
      openCarouselModal: onCarouselOpen,
      setCarouselItems,
      setEditingCarouselPos,
    });
  }, [registerCallbacks, onUploadImage, onCarouselOpen]);

  const onSelectImage = () => {
    selectImageFile(async (file, dimensions) => {
      if (onUploadImage) {
        const src = await onUploadImage(file);
        cmd.execCommand(
          view,
          cmd.insertCustomImage({
            src,
            width: dimensions.width,
            height: dimensions.height,
          }),
        );
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          cmd.execCommand(
            view,
            cmd.insertCustomImage({
              src,
              width: dimensions.width,
              height: dimensions.height,
            }),
          );
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const onSelectVideo = () => {
    selectVideoFile(async (file, { width, height }) => {
      if (onUploadVideo) {
        const src = await onUploadVideo(file);
        cmd.execCommand(view, cmd.insertVideo({ src, width, height }));
      } else {
        const url = URL.createObjectURL(file);
        cmd.execCommand(view, cmd.insertVideo({ src: url, width, height }));
      }
    });
  };

  const onSelectAudio = () => {
    selectAudioFile(async (file) => {
      if (onUploadAudio) {
        const src = await onUploadAudio(file);
        cmd.execCommand(view, cmd.insertAudioWaveform({ src }));
      } else {
        const base64 = await fileToBase64(file);
        cmd.execCommand(view, cmd.insertAudioWaveform({ src: base64 }));
      }
    });
  };

  const onInitCarouselOpen = () => {
    setEditingCarouselPos(null);
    setCarouselItems([]);
    onCarouselOpen();
  };

  const handlePublish = () => {
    if (!onPublish || !view) return;
    const content = view.state.doc.toJSON() as Record<string, unknown>;
    onPublish({ title: getValues("title"), content });
  };

  const floatingMenuItems: DropdownItem[] = [
    {
      title: "Photo",
      Icon: () => <AddPhotoIcon size={20} />,
      action: onSelectImage,
    },
    {
      title: "Video",
      Icon: () => <AddVideoIcon size={20} />,
      action: onSelectVideo,
    },
    {
      title: "Music",
      Icon: () => <AddMusicIcon size={20} />,
      action: onSelectAudio,
    },
    {
      title: "Gallery",
      Icon: () => <AddGalleryIcon size={20} />,
      action: onInitCarouselOpen,
    },
  ];

  const marksMenuItems: DropdownItem[] = [
    {
      title: "Normal text",
      Icon: () => <MarksIcon size={20} />,
      action: () => {
        cmd.execCommand(view, cmd.clearNodesAndMarks());
      },
    },
    {
      title: "Heading 2",
      Icon: () => <H2Icon size={20} />,
      action: () => cmd.execCommand(view, cmd.toggleHeading(2)),
    },
    {
      title: "Heading 3",
      Icon: () => <H3Icon size={20} />,
      action: () => cmd.execCommand(view, cmd.toggleHeading(3)),
    },
    {
      title: "Bullet list",
      Icon: () => <ListIcon size={20} />,
      action: () => cmd.execCommand(view, cmd.toggleBulletList()),
    },
    {
      title: "Numbered list",
      Icon: () => <NumberedListIcon size={20} />,
      action: () => cmd.execCommand(view, cmd.toggleOrderedList()),
    },
    {
      title: "Quote",
      Icon: () => <CitationIcon size={20} />,
      action: () => cmd.execCommand(view, cmd.toggleBlockquote()),
    },
    {
      title: "Code",
      Icon: () => <CodeIcon size={20} />,
      action: () => cmd.execCommand(view, cmd.toggleCodeBlock()),
    },
  ];

  return (
    <EditorActionsContext.Provider
      value={{
        hasMainImage,
        setHasMainImage,
        carouselItems,
        setCarouselItems,
        editingCarouselPos,
        setEditingCarouselPos,
        openCarouselModal: onCarouselOpen,
        floatingMenuItems,
        marksMenuItems,
        onSelectImage,
        onBack,
        handlePublish,
        onUploadImage,
      }}
    >
      {children}
      {isCarouselModalOpen && (
        <Suspense fallback={null}>
          <CarouselModal isOpen={isCarouselModalOpen} onClose={onCarouselClose} />
        </Suspense>
      )}
    </EditorActionsContext.Provider>
  );
}

// --- Provider ---

export const EditorContextProvider: FC<RichArticleEditorProps & { children: ReactNode }> = ({
  children,
  defaultTitle,
  defaultContent,
  onSave,
  onBack,
  onPublish,
  onUploadImage,
  onUploadVideo,
  onUploadAudio,
}) => {
  const saveTimer = useRef<number | null>(null);
  const callbacksRef = useRef<EditorCallbacks>({});

  const registerCallbacks = (cbs: EditorCallbacks) => {
    Object.assign(callbacksRef.current, cbs);
  };

  const defaultDoc = defaultContent ?? { type: "doc", content: [{ type: "paragraph" }] };

  const methods = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      title: defaultTitle ?? "",
      content: defaultDoc,
    },
  });

  const {
    setValue,
    formState: { defaultValues },
    handleSubmit,
  } = methods;

  const onSubmitForm = async (values: FieldValues) => {
    await onSave?.({
      title: values.title as string,
      content: values.content as Record<string, unknown>,
    });
  };

  const scheduleSave = (editorView: EditorView) => {
    if (saveTimer.current !== null) {
      window.clearTimeout(saveTimer.current);
    }

    saveTimer.current = window.setTimeout(() => {
      const json = editorView.state.doc.toJSON();
      setValue("content", json, {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      });
      handleSubmit(onSubmitForm)();
    }, SERVER_UPDATE_TIMEOUT);
  };

  // eslint-disable-next-line react-hooks/refs -- ref object (not .current) passed to plugin, read at mount time only
  const plugins = [...buildKeymap(), ...buildPlugins(), createCallbackPlugin(callbacksRef)];

  const { view, mountRef } = useEditor({
    schema: editorSchema,
    doc: (defaultValues?.content ?? defaultDoc) as Record<string, unknown>,
    plugins,
    editorProps: {
      handleScrollToSelection: () => false,
      handleDOMEvents: {
        mousedown(view, event) {
          const target = event.target as HTMLElement | null;
          if (!target) {
            return false;
          }

          const a = target.closest("a[href]");
          if (!a) {
            return false;
          }

          event.preventDefault();

          const posInfo = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (!posInfo) {
            return true;
          }

          const { state } = view;
          const $pos = state.doc.resolve(posInfo.pos);
          const range = getMarkRange($pos, state.schema.marks.link);

          if (range) {
            const tr = state.tr.setSelection(TextSelection.create(state.doc, range.from, range.to));

            view.dispatch(tr);
            view.focus();
          }

          return true;
        },
        click(_view, event) {
          const target = event.target as HTMLElement | null;
          if (!target) {
            return false;
          }
          if (target.closest("a[href]")) {
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
      nodeViews: {
        mainImage: mainImageNodeView,
        customImage: customImageNodeView,
        video: customVideoNodeView,
        audioWaveform: audioWaveformNodeView,
        imageCarousel: imageCarouselNodeView,
        detailsSummary: detailsSummaryNodeView,
      },
    },
    onUpdate: (editorView) => {
      scheduleSave(editorView);
      pinMainBg(editorView);
    },
  });

  return (
    <FormProvider {...methods}>
      <EditorInstanceContext.Provider value={{ view, mountRef }}>
        <TitleAutoSave onSave={onSave} />
        <LinkProvider>
          <ActionsProvider
            registerCallbacks={registerCallbacks}
            onBack={onBack}
            onPublish={onPublish}
            onUploadImage={onUploadImage}
            onUploadVideo={onUploadVideo}
            onUploadAudio={onUploadAudio}
          >
            {children}
          </ActionsProvider>
        </LinkProvider>
      </EditorInstanceContext.Provider>
    </FormProvider>
  );
};
