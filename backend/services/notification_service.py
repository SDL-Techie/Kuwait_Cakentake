# import requests

# # N8N_WEBHOOK_URL = "https://hashviper.app.n8n.cloud/webhook-test/order-event"

# def send_order_notification(payload):
#     try:
#         print("========== SENDING TO N8N ==========")
#         print(payload)

#         response = requests.post(
#             # N8N_WEBHOOK_URL,
#             json=payload,
#             timeout=15
#         )

#         print("STATUS CODE:", response.status_code)
#         print("RESPONSE:", response.text)

#         response.raise_for_status()

#         print("✅ Order notification sent to n8n")

#         return True

#     except Exception as e:
#         print("❌ N8N Error:", str(e))
#         return False


import requests

# N8N_WEBHOOK_URL = "https://hashviper.app.n8n.cloud/webhook-test/order-event"

def send_order_notification(payload):
    try:
        print("========== N8N DISABLED ==========")
        print(payload)

        # response = requests.post(
        #     N8N_WEBHOOK_URL,
        #     json=payload,
        #     timeout=15
        # )

        # print("STATUS CODE:", response.status_code)
        # print("RESPONSE:", response.text)
        # response.raise_for_status()

        print("✅ Notification skipped.")

        return True

    except Exception as e:
        print("❌ N8N Error:", str(e))
        return False