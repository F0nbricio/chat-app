import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3001');

function App() {
  // Estados de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Estados do Chat e Conexão
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [room, setRoom] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  
  const chatEndRef = useRef(null);

  // Monitorizar estado de conexão do Socket
  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    socket.on('load_history', (history) => {
      setMessageList(history);
    });

    socket.on('receive_message', (data) => {
      setMessageList((list) => [...list, data]);
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('load_history');
      socket.off('receive_message');
    };
  }, []);

  // Lidar com o Registo
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao registar');
      
      alert('Registo efetuado com sucesso! Faça login.');
      setIsRegistering(false);
      setPassword('');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  // Lidar com o Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao fazer login');

      setIsAuthenticated(true);
      setPassword('');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  // Lidar com a Recuperação / Redefinição de Palavra-passe
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('http://localhost:3001/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, newPassword: password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao alterar palavra-passe');

      alert('Palavra-passe alterada com sucesso! Faça login com a nova senha.');
      setIsForgot(false);
      setPassword('');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const joinRoom = () => {
    if (room.trim() !== '') {
      socket.emit('join_room', room);
      setShowChat(true);
    }
  };

  const sendMessage = async () => {
    if (currentMessage.trim() !== '') {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      await socket.emit('send_message', messageData);
      setCurrentMessage('');
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageList]);

  // Se não estiver autenticado, mostra o ecrã de Login / Registo / Recuperação
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100 font-sans">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-indigo-400">DevChat</h2>
            <p className="text-sm text-slate-400 mt-1">
              {isForgot ? 'Redefinir palavra-passe' : isRegistering ? 'Crie a sua conta de acesso' : 'Entre com a sua conta'}
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl text-center">
              {authError}
            </div>
          )}

          <form onSubmit={isForgot ? handleForgotPassword : isRegistering ? handleRegister : handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Utilizador</label>
              <input
                type="text"
                required
                placeholder="Seu nome de utilizador..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-100 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                {isForgot ? 'Nova Palavra-passe' : 'Palavra-passe'}
              </label>
              <input
                type="password"
                required
                placeholder={isForgot ? 'Insira a nova palavra-passe...' : 'Sua palavra-passe...'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-100 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 cursor-pointer mt-2"
            >
              {isForgot ? 'Atualizar Palavra-passe' : isRegistering ? 'Registar Conta' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center space-y-2 text-center">
            {!isForgot && (
              <button
                onClick={() => { setIsForgot(true); setIsRegistering(false); setAuthError(''); }}
                className="text-xs text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
              >
                Esqueceu-se da palavra-passe?
              </button>
            )}
            <button
              onClick={() => { setIsForgot(false); setIsRegistering(!isRegistering); setAuthError(''); }}
              className="text-xs text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              {isForgot ? 'Voltar ao login' : isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem conta? Registe-se aqui'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100 font-sans">
      {!showChat ? (
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-indigo-400">Salas de Chat</h2>
            <p className="text-sm text-slate-400 mt-1">Bem-vindo, <span className="text-slate-200 font-semibold">{username}</span>!</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Nome da Sala</label>
              <input
                type="text"
                placeholder="Ex: geral, projetos..."
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-100 transition-colors"
              />
            </div>
            <button
              onClick={joinRoom}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 cursor-pointer mt-2"
            >
              Entrar na Sala
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-screen w-screen md:h-[85vh] md:w-[700px] bg-slate-800 md:rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          {/* Header com Indicador Dinâmico de Conexão */}
          <div className="bg-slate-800/80 backdrop-blur border-b border-slate-700 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-indigo-400 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                {isConnected ? `Sala: ${room}` : 'Conexão perdida...'}
              </h3>
              <p className="text-xs text-slate-400">Logado como <span className="text-slate-200 font-medium">{username}</span></p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Sair da Sala
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900/50">
            {messageList.map((content, index) => {
              const isMyMessage = content.author === username;
              return (
                <div key={index} className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                  <span className="text-[11px] text-slate-400 mb-1 px-1">{content.author}</span>
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm text-sm break-words ${
                      isMyMessage
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-700 text-slate-100 rounded-tl-none'
                    }`}
                  >
                    <p>{content.message}</p>
                    <span className={`text-[10px] block mt-1 text-right ${isMyMessage ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {content.time}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-3">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-100 text-sm"
            />
            <button
              onClick={sendMessage}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;