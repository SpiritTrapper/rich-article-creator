import { RichArticleEditor } from "rich-article-creator";
import "rich-article-creator/style.css";
// import "./custom-theme.css"; // Uncomment to apply custom theme

function App() {
  return (
    <RichArticleEditor
      onSave={(data) => console.log("Auto-save:", data)}
      onPublish={(data) => console.log("Publish:", data)}
    />
  );
}

export default App;
