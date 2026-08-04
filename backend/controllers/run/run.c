#include <stdio.h>
#include "run.h"

// "system" | "info" | "success" | "warning" | "error" | "code" | "code_error";
int run(struct mg_connection *c , struct mg_ws_message *wm) {
    struct mg_str response = mg_str("Hello from the websocket!");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    build_ws_response(&response, WS_SYSTEM, "This is a test system message from the websocket!");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    build_ws_response(&response, WS_INFO, "This is a test info message from the websocket!");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    build_ws_response(&response, WS_SUCCESS, "This is a test success message from the websocket!");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    build_ws_response(&response, WS_WARNING, "This is a test warning message from the websocket!");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    build_ws_response(&response, WS_ERROR, "This is a test error message from the websocket!");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    build_ws_response(&response, WS_CODE, "This is a test code message from the websocket!");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    build_ws_response(&response, WS_CODE_ERROR, "This is a test code error message from the websocket!");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    build_ws_response(&response, WS_END, "This is a test end message from the websocket!");
    mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);

    return 0;
}
