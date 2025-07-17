import { useEffect, useState } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [reply, setReply] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    setReply("👋 Hi, I am MindBot, your AI assistant! How can I help you regarding your venture today?");
  }, []);

  const askMindBot = () => {
    setReply('');
    setIsStreaming(true);

    const eventSource = new EventSource(`http://localhost:5000/ask?prompt=${encodeURIComponent(input)}`);

    eventSource.onmessage = (event) => {
      if (event.data === '[DONE]') {
        eventSource.close();
        setIsStreaming(false);
      } else {
        setReply((prev) => prev + event.data);
      }
    };

    eventSource.onerror = (err) => {
      console.error('Stream error:', err);
      eventSource.close();
      setReply('❌ Could not connect to MindBot.');
      setIsStreaming(false);
    };
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🧠 MindBot</h1>
      <p style={{ whiteSpace: 'pre-line' }}>{reply}</p>
      <input
        type="text"
        placeholder="Ask anything..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={askMindBot} disabled={isStreaming}>Ask</button>
    </div>
  );
}

export default App;
