Render

INFO:     182.19.225.177:0 - "OPTIONS /api/reviews/?country=australia HTTP/1.1" 200 OK
INFO:     182.19.225.177:0 - "GET /api/reviews/?country=australia HTTP/1.1" 405 Method Not Allowed
INFO:     182.19.225.177:0 - "OPTIONS /api/freight-forwarders/?limit=18&random_select=true HTTP/1.1" 200 OK
INFO:     182.19.225.177:0 - "GET /api/freight-forwarders/?limit=18&random_select=true HTTP/1.1" 200 OK
INFO:     182.19.225.177:0 - "GET /api/freight-forwarders/?limit=18&random_select=true HTTP/1.1" 200 OK
INFO:     182.19.225.177:0 - "GET /api/reviews/?country=australia HTTP/1.1" 405 Method Not Allowed
INFO:     182.19.225.177:0 - "GET /api/reviews/?country=australia HTTP/1.1" 405 Method Not Allowed
INFO:     182.19.225.177:0 - "GET /api/reviews/?country=australia HTTP/1.1" 405 Method Not Allowed

client

[Log] Auth state updated: – {user: null, subscription_tier: undefined, userSubscription: "free"} (17.BR02wzjn.js, line 1)
[Error] Failed to load resource: the server responded with a status of 405 () (reviews, line 0)
[Log] API Error Response: – {status: 405, statusText: "", errorText: "{\"detail\":\"Method Not Allowed\"}", …} (cUhfznSR.js, line 1)
{status: 405, statusText: "", errorText: "{\"detail\":\"Method Not Allowed\"}", headers: Object}Object
[Error] Failed to fetch reviews for country: – Error: API request failed: 405  - {"detail":"Method Not Allowed"} — cUhfznSR.js:1:965
Error: API request failed: 405  - {"detail":"Method Not Allowed"} — cUhfznSR.js:1:965
	(anonymous function) (cUhfznSR.js:1:6378)

    