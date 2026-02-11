import { ReactElement } from "react";

import {
  ImagePlus as AddPhotoIcon,
  Video as AddVideoIcon,
  Music as AddMusicIcon,
  Images as AddGalleryIcon,
} from "lucide-react";

import { useEditorActions } from "@contexts/EditorContext";

export interface DropdownItem {
  title: string;
  Icon: () => ReactElement;
  action: () => void;
  disabled?: boolean;
}

export function useFloatingMenuItems(): DropdownItem[] {
  const { onSelectImage, onSelectVideo, onSelectAudio, onInitCarouselOpen } =
    useEditorActions();

  return [
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
}
