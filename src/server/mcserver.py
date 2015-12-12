from flask_socketio import emit

@socketio.on("connect", namespace='/')
def start_connection():
    emit("connected", {"answer": "connected"})
