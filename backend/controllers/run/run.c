#include <stdio.h>
#include "run.h"

// "system" | "info" | "success" | "warning" | "error" | "code" | "code_error";
int run(struct mg_connection *c , struct mg_ws_message *wm) {
    struct mg_str response = mg_str("Hello from the websocket!");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    response = mg_str("{\"type\": \"system\", \"message\": \"This is a test system message from the websocket!\"}");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    response = mg_str("{\"type\": \"info\", \"message\": \"This is a test info message from the websocket!\"}");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    response = mg_str("{\"type\": \"success\", \"message\": \"This is a test success message from the websocket!\"}");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    response = mg_str("{\"type\": \"warning\", \"message\": \"This is a test warning message from the websocket!\"}");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    response = mg_str("{\"type\": \"error\", \"message\": \"This is a test error message from the websocket!\"}");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    response = mg_str("{\"type\": \"code\", \"message\": \"This is a test code message from the websocket!\"}");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    response = mg_str("{\"type\": \"code_error\", \"message\": \"This is a test code error message from the websocket!\"}");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    response = mg_str("{\"type\": \"end\", \"message\": \"This is a test end message from the websocket!\"}");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    return 0;
}
