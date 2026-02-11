import { RichArticleEditor } from "./RichArticleEditor";

function App() {
  return (
    <RichArticleEditor
      onSave={(data) => console.log("Auto-save:", data)}
      onPublish={(data) => console.log("Publish:", data)}
    />
  );
}

export default App;
