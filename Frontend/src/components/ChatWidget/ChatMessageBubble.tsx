// import React from "react";

// import {
//   useNavigate,
// } from "react-router-dom";

// import type {
//   ChatMessage,
// } from "../../services/chatbotService";

// import "./ChatWidget.css";

// interface Props {
//   message: ChatMessage;
// }

// const ChatMessageBubble: React.FC<Props> = ({
//   message,
// }) => {
//   const navigate =
//     useNavigate();

//   const isUser =
//     message.role === "user";

//   const handleNavigate = () => {
//     if (
//       message.action === "navigate" &&
//       message.url
//     ) {
//       navigate(message.url);
//     }
//   };

//   const handleProductClick = (
//     productId: number
//   ) => {
//     navigate(
//       `/product/${productId}`
//     );
//   };

//   return (
//     <div
//       className={`baker-msg-row ${
//         isUser
//           ? "baker-msg-row-user"
//           : "baker-msg-row-bot"
//       }`}
//     >
//       <div
//         className={`baker-msg-bubble ${
//           isUser
//             ? "baker-msg-user"
//             : "baker-msg-bot"
//         }`}
//       >
//         <p className="baker-msg-text">
//           {message.text}
//         </p>

//         {!!message.products
//           ?.length && (
//           <div className="baker-product-cards">
//             {message.products
//               .slice(0, 4)
//               .map((product) => (
//                 <button
//                   key={product.id}
//                   className="baker-product-card"
//                   onClick={() =>
//                     handleProductClick(
//                       product.id
//                     )
//                   }
//                 >
//                   {product.image_url && (
//                     <img
//                       src={
//                         product.image_url
//                       }
//                       alt={
//                         product.name
//                       }
//                       className="baker-product-img"
//                     />
//                   )}

//                   <div className="baker-product-info">
//                     <span className="baker-product-name">
//                       {product.name}
//                     </span>

//                     <span className="baker-product-price">
//                       {product.currency
//                         ? `${product.currency} `
//                         : "KWD "}
//                       {product.price}
//                     </span>
//                   </div>
//                 </button>
//               ))}
//           </div>
//         )}

//         {message.order && (
//           <div className="baker-order-card">
//             <strong>
//               Order #
//               {String(
//                 message.order
//                   .order_number ??
//                   message.order.id ??
//                   ""
//               )}
//             </strong>

//             {message.order.status && (
//               <div>
//                 Status:{" "}
//                 {message.order.status}
//               </div>
//             )}

//             {message.order.payment_status && (
//               <div>
//                 Payment:{" "}
//                 {
//                   message.order
//                     .payment_status
//                 }
//               </div>
//             )}

//             {message.order.grand_total != null && (
//               <div>
//                 Total:{" "}
//                 {message.order.currency ||
//                   "KWD"}{" "}
//                 {
//                   message.order
//                     .grand_total
//                 }
//               </div>
//             )}
//           </div>
//         )}

//         {message.action ===
//           "navigate" &&
//           message.url && (
//             <button
//               className="baker-redirect-btn"
//               onClick={
//                 handleNavigate
//               }
//             >
//               Open page →
//             </button>
//           )}
//       </div>
//     </div>
//   );
// };

// export default ChatMessageBubble;


import React from "react";

import {
  useNavigate,
} from "react-router-dom";

import type {
  ChatMessage,
} from "../../services/chatbotService";

import BakerBot from "./Bakerbot";

import "./ChatWidget.css";

interface Props {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<Props> = ({
  message,
}) => {
  const navigate =
    useNavigate();

  const isUser =
    message.role === "user";

  const handleNavigate = () => {
    if (
      message.action === "navigate" &&
      message.url
    ) {
      navigate(message.url);
    }
  };

  const handleProductClick = (
    productId: number
  ) => {
    navigate(
      `/product/${productId}`
    );
  };

  const time = (() => {
    try {
      return new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  })();

  return (
    <div
      className={`baker-msg-row ${
        isUser
          ? "baker-msg-row-user"
          : "baker-msg-row-bot"
      }`}
    >
      {!isUser && (
        <span className="baker-msg-avatar">
          <BakerBot size={22} animate={false} />
        </span>
      )}

      <div
        className={`baker-msg-bubble ${
          isUser
            ? "baker-msg-user"
            : "baker-msg-bot"
        }`}
      >
        <p className="baker-msg-text">
          {message.text}
        </p>

        {!!message.products
          ?.length && (
          <div className="baker-product-cards">
            {message.products
              .slice(0, 4)
              .map((product) => (
                <button
                  key={product.id}
                  className="baker-product-card"
                  onClick={() =>
                    handleProductClick(
                      product.id
                    )
                  }
                >
                  {product.image_url && (
                    <img
                      src={
                        product.image_url
                      }
                      alt={
                        product.name
                      }
                      className="baker-product-img"
                    />
                  )}

                  <div className="baker-product-info">
                    <span className="baker-product-name">
                      {product.name}
                    </span>

                    <span className="baker-product-price">
                      {product.currency
                        ? `${product.currency} `
                        : "KWD "}
                      {product.price}
                    </span>
                  </div>
                </button>
              ))}
          </div>
        )}

        {message.order && (
          <div className="baker-order-card">
            <strong>
              Order #
              {String(
                message.order
                  .order_number ??
                  message.order.id ??
                  ""
              )}
            </strong>

            {message.order.status && (
              <div>
                Status:{" "}
                {message.order.status}
              </div>
            )}

            {message.order.payment_status && (
              <div>
                Payment:{" "}
                {
                  message.order
                    .payment_status
                }
              </div>
            )}

            {message.order.grand_total != null && (
              <div>
                Total:{" "}
                {message.order.currency ||
                  "KWD"}{" "}
                {
                  message.order
                    .grand_total
                }
              </div>
            )}
          </div>
        )}

        {message.action ===
          "navigate" &&
          message.url && (
            <button
              className="baker-redirect-btn"
              onClick={
                handleNavigate
              }
            >
              Open page →
            </button>
          )}

        {time && <span className="baker-msg-time">{time}</span>}
      </div>
    </div>
  );
};

export default ChatMessageBubble;