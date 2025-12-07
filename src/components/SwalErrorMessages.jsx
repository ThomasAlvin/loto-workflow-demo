import ReactDOMServer from "react-dom/server";
import { FaTriangleExclamation } from "react-icons/fa6";

function SwalErrorMessagesComponent({ errorData }) {
  if (errorData) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {Array.isArray(errorData) ? (
          <>
            <div style={{ fontWeight: 700 }}>An error occurred!</div>
            {errorData.map((err, index) => (
              <div className="swal-error-messages-container">
                <div>
                  <FaTriangleExclamation />
                </div>
                <div>{err}</div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ fontWeight: 700 }}>{errorData}</div>
        )}
      </div>
    );
  } else {
    <div style={{ fontWeight: 700 }}>An error occured</div>;
  }
}

// Function to generate the HTML string dynamically
function SwalErrorMessages(errorData) {
  return ReactDOMServer.renderToStaticMarkup(
    <SwalErrorMessagesComponent errorData={errorData} />
  );
}

export default SwalErrorMessages;
