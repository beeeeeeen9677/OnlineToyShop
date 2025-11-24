import CsChatWindow from "./CsChatWindow";

function CsPanel() {
  return (
    <div className="z-30 fixed top-15 bottom-25 inset-x-20 bg-gray-300 dark:bg-gray-500 rounded-2xl flex ">
      <CsChatWindow />
    </div>
  );
}

export default CsPanel;
