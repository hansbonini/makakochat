/* --------------------------------------------------------------------
   Código JSX do Cliente de Chat
   Nota: Buildar posteriormente com compilador Babel
   --------------------------------------------------------------------*/

   var config = {
     title: "Makako Chat",
   };

   var Chat = React.createClass({
     render: function () {
       return (
        <div id="chat">
         <ChatHeader />
         <div className="mui-container-fluid">
           <div className="mui-row chat-content">
            <ChatContent />
            <ChatList />
           </div>
           <div className="mui-row chat-footer">
            <ChatInput />
           </div>
          </div>
        </div>
       );
     },
   });

   var ChatHeader = React.createClass({
     render: function() {
       return (
         <header id="header">
           <div className="mui-appbar mui--appbar-line-height">
             <div className="mui-container-fluid">
              <span className="mui--text-title">☰ {config.title}</span>
             </div>
           </div>
         </header>
       );
     },
   });

   var ChatContent = React.createClass({
     render: function () {
       return (
         <main className="mui-col-md-10">
         </main>
       );
     }
   });

   var ChatList = React.createClass({
     render: function() {
       return (
         <aside className="mui-col-md-2">
         </aside>
       );
     },
   });

   var ChatInput = React.createClass({
     render: function() {
       return (
         <footer className="mui-col-md-12"></footer>
       );
     },
   });

   ReactDOM.render(
     <Chat />,
     document.getElementById('wrapper')
   );
