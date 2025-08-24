client

[Error] Failed to load resource: the server responded with a status of 405 () (reviews, line 0)
[Error] Failed to create comprehensive review: – Error: API request failed: 405  - {"detail":"Method Not Allowed"}
Error: API request failed: 405  - {"detail":"Method Not Allowed"}
	(anonymous function) (DrglFGDX.js:1:2001)
[Error] Review submission failed: – Error: API request failed: 405  - {"detail":"Method Not Allowed"}
Error: API request failed: 405  - {"detail":"Method Not Allowed"}
	(anonymous function) (12.Dg1C1cvf.js:1:7678)

  backend log

  2025-08-12T16:18:34.53871062Z INFO:     182.19.225.177:0 - "OPTIONS /api/freight-forwarders/?limit=18&random_select=true HTTP/1.1" 200 OK
2025-08-12T16:18:34.759229139Z INFO:     182.19.225.177:0 - "GET /api/freight-forwarders/?limit=18&random_select=true HTTP/1.1" 200 OK
2025-08-12T16:18:54.216456182Z INFO:     182.19.225.177:0 - "OPTIONS /api/users/request-code HTTP/1.1" 200 OK
2025-08-12T16:18:55.26435959Z INFO:email_service:Verification code email sent successfully to admin@evalurate.net
2025-08-12T16:18:55.265263491Z INFO:     182.19.225.177:0 - "POST /api/users/request-code HTTP/1.1" 200 OK
2025-08-12T16:21:49.939889533Z INFO:     182.19.225.177:0 - "OPTIONS /api/users/signin-with-code HTTP/1.1" 200 OK
2025-08-12T16:21:50.007346313Z INFO:     182.19.225.177:0 - "POST /api/users/signin-with-code HTTP/1.1" 200 OK
2025-08-12T16:21:58.067114826Z INFO:     182.19.225.177:0 - "GET /api/freight-forwarders/?limit=18&random_select=true HTTP/1.1" 200 OK
2025-08-12T16:22:01.080364557Z INFO:     182.19.225.177:0 - "OPTIONS /api/freight-forwarders/97e6bc83-8e6e-4b3e-b702-871fb81e2222 HTTP/1.1" 200 OK
2025-08-12T16:22:01.123080885Z INFO:     182.19.225.177:0 - "GET /api/freight-forwarders/97e6bc83-8e6e-4b3e-b702-871fb81e2222 HTTP/1.1" 200 OK
2025-08-12T16:22:03.493190725Z INFO:     182.19.225.177:0 - "GET /api/freight-forwarders/97e6bc83-8e6e-4b3e-b702-871fb81e2222 HTTP/1.1" 200 OK
2025-08-12T16:22:03.520129146Z INFO:     182.19.225.177:0 - "OPTIONS /api/freight-forwarders/ HTTP/1.1" 200 OK
2025-08-12T16:22:03.625434594Z INFO:     182.19.225.177:0 - "GET /api/freight-forwarders/ HTTP/1.1" 200 OK
2025-08-12T16:22:03.655322281Z INFO:     182.19.225.177:0 - "OPTIONS /api/reviews/questions HTTP/1.1" 200 OK
2025-08-12T16:22:03.685434374Z INFO:     182.19.225.177:0 - "GET /api/reviews/questions HTTP/1.1" 405 Method Not Allowed
2025-08-12T16:27:27.8746611Z INFO:     64.23.255.79:0 - "OPTIONS /api/freight-forwarders/?limit=18&random_select=true HTTP/1.1" 200 OK
2025-08-12T16:33:12.995143487Z INFO:     182.19.225.177:0 - "OPTIONS /api/users/request-code HTTP/1.1" 200 OK
2025-08-12T16:33:13.85778204Z INFO:email_service:Verification code email sent successfully to admin@evalurate.net
2025-08-12T16:33:13.858477606Z INFO:     182.19.225.177:0 - "POST /api/users/request-code HTTP/1.1" 200 OK
2025-08-12T16:34:32.574204424Z INFO:     182.19.225.177:0 - "OPTIONS /api/users/signin-with-code HTTP/1.1" 200 OK
2025-08-12T16:34:32.694522194Z INFO:     182.19.225.177:0 - "POST /api/users/signin-with-code HTTP/1.1" 200 OK
2025-08-12T16:34:40.931786066Z INFO:     182.19.225.177:0 - "OPTIONS /api/freight-forwarders/5fbd05b0-8d1c-4254-b79f-71aa382275d3 HTTP/1.1" 200 OK
2025-08-12T16:34:40.988840771Z INFO:     182.19.225.177:0 - "GET /api/freight-forwarders/5fbd05b0-8d1c-4254-b79f-71aa382275d3 HTTP/1.1" 200 OK
2025-08-12T16:39:40.312186447Z INFO:     143.244.185.190:0 - "OPTIONS /api/freight-forwarders/?limit=18&random_select=true HTTP/1.1" 200 OK
2025-08-12T16:40:09.824765558Z INFO:     182.19.225.177:0 - "GET /api/freight-forwarders/5fbd05b0-8d1c-4254-b79f-71aa382275d3 HTTP/1.1" 200 OK
2025-08-12T16:40:22.875973295Z INFO:email_service:Verification code email sent successfully to admin@evalurate.net
2025-08-12T16:40:22.877139802Z INFO:     182.19.225.177:0 - "POST /api/users/request-code HTTP/1.1" 200 OK
2025-08-12T16:41:30.155246904Z INFO:     182.19.225.177:0 - "POST /api/users/signin-with-code HTTP/1.1" 200 OK
2025-08-12T16:41:36.855559089Z INFO:     182.19.225.177:0 - "GET /api/freight-forwarders/5fbd05b0-8d1c-4254-b79f-71aa382275d3 HTTP/1.1" 200 OK
2025-08-12T16:41:36.893670042Z INFO:     182.19.225.177:0 - "OPTIONS /api/freight-forwarders/ HTTP/1.1" 200 OK
2025-08-12T16:41:37.010277952Z INFO:     182.19.225.177:0 - "GET /api/freight-forwarders/ HTTP/1.1" 200 OK
2025-08-12T16:41:37.040369425Z INFO:     182.19.225.177:0 - "OPTIONS /api/reviews/questions HTTP/1.1" 200 OK
2025-08-12T16:41:37.068528595Z INFO:     182.19.225.177:0 - "GET /api/reviews/questions HTTP/1.1" 405 Method Not Allowed
2025-08-12T16:42:43.057054609Z INFO:     182.19.225.177:0 - "OPTIONS /api/reviews/ HTTP/1.1" 200 OK
2025-08-12T16:42:43.088952413Z INFO:     182.19.225.177:0 - "POST /api/reviews/ HTTP/1.1" 405 Method Not Allowed

