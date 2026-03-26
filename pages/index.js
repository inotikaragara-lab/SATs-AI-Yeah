import { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  "英語が全然伸びないんだけど😢",
  "志望校どうやって決めたらいい？",
  "数学の勉強法教えて！",
  "やる気が出ないときどうする？",
  "参考書多すぎて何選べばいい？",
  "推薦と一般どっちがいい？",
];

const MOODS = [
  { emoji: "😵", label: "しんどい" },
  { emoji: "😤", label: "やる気ある" },
  { emoji: "😕", label: "迷ってる" },
  { emoji: "😴", label: "疲れた" },
];

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "やあ👋 カベ先生だよ！\n勉強・進路・なんでも気軽に話しかけてね。\n今どんな感じ？" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    const moodPrefix = selectedMood ? `[今の気分：${selectedMood.label}${selectedMood.emoji}] ` : "";
    const fullText = moodPrefix + userText;
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setInput("");
    setSelectedMood(null);
    setShowSuggestions(false);
    setLoading(true);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      history.push({ role: "user", content: fullText });
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "ごめん、うまく答えられなかった😅 もう一回試してみて！";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "接続エラーが起きちゃった😅 もう一度試してみてね！" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <main style={styles.root}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <div style={styles.avatar}>📚</div>
            <div>
              <div style={styles.headerTitle}>カベ先生</div>
              <div style={styles.headerSub}>受験生の壁打ち部屋</div>
            </div>
          </div>
          <div style={styles.badge}>24h対応</div>
        </header>
        <div style={styles.chatArea}>
          {messages.map((msg, i) => (
            <div key={i} style={{ ...styles.msgRow, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "assistant" && <div style={styles.botIcon}>📚</div>}
              <div style={msg.role === "user" ? styles.userBubble : styles.botBubble}>
                {msg.content.split("\n").map((line, j) => (
                  <span key={j}>{line}{j < msg.content.split("\n").length - 1 && <br />}</span>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ ...styles.msgRow, justifyContent: "flex-start" }}>
              <div style={styles.botIcon}>📚</div>
              <div style={styles.botBubble}>
                <div style={styles.typingDots}>
                  <span style={{ ...styles.dot, animationDelay: "0s" }} />
                  <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
                  <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}
          {showSuggestions && messages.length === 1 && (
            <div style={styles.suggestArea}>
              <div style={styles.suggestLabel}>💬 こんな相談もできるよ</div>
              <div style={styles.suggestGrid}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} style={styles.suggestBtn} onClick={() => sendMessage(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={styles.moodRow}>
          <span style={styles.moodLabel}>今の気分：</span>
          {MOODS.map((m) => (
            <button key={m.label} style={{ ...styles.moodBtn, ...(selectedMood?.label === m.label ? styles.moodBtnActive : {}) }}
              onClick={() => setSelectedMood(selectedMood?.label === m.label ? null : m)}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
        <div style={styles.inputArea}>
          <textarea style={styles.textarea} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey} placeholder="なんでも話しかけてみて！" rows={2} disabled={loading} />
          <button style={{ ...styles.sendBtn, opacity: (!input.trim() || loading) ? 0.5 : 1 }}
            onClick={() => sendMessage()} disabled={!input.trim() || loading}>送る →</button>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: linear-gradient(135deg, #f0f4ff, #fef6ff); min-height: 100vh; font-family: 'M PLUS Rounded 1c', sans-serif; }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        textarea:focus { outline: none; }
        button { cursor: pointer; border: none; font-family: inherit; }
      `}</style>
    </main>
  );
}

const styles = {
  root: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" },
  container: { width: "100%", maxWidth: "480px", background: "rgba(255,255,255,0.9)", borderRadius: "28px", boxShadow: "0 8px 40px rgba(100,100,180,0.15)", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: "620px", maxHeight: "90vh" },
  header: { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  headerInner: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { width: "44px", height: "44px", background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", border: "2px solid rgba(255,255,255,0.4)" },
  headerTitle: { color: "white", fontWeight: "800", fontSize: "17px" },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: "11px" },
  badge: { background: "rgba(255,255,255,0.2)", color: "white", fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.3)" },
  chatArea: { flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: "12px" },
  msgRow: { display: "flex", alignItems: "flex-end", gap: "8px", animation: "fadeUp 0.3s ease" },
  botIcon: { width: "32px", height: "32px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 },
  botBubble: { background: "white", border: "1.5px solid #e8eaff", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", fontSize: "14px", lineHeight: "1.7", color: "#2d2d4e", maxWidth: "78%", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", fontWeight: "500" },
  userBubble: { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "18px 18px 4px 18px", padding: "12px 16px", fontSize: "14px", lineHeight: "1.7", color: "white", maxWidth: "78%", fontWeight: "500" },
  typingDots: { display: "flex", gap: "4px", alignItems: "center" },
  dot: { width: "7px", height: "7px", background: "#6366f1", borderRadius: "50%", display: "inline-block", animation: "bounce 1.2s ease-in-out infinite" },
  suggestArea: { marginTop: "8px" },
  suggestLabel: { fontSize: "12px", color: "#888", fontWeight: "600", marginBottom: "8px" },
  suggestGrid: { display: "flex", flexWrap: "wrap", gap: "8px" },
  suggestBtn: { background: "white", border: "1.5px solid #e0e3ff", borderRadius: "20px", padding: "7px 14px", fontSize: "13px", color: "#5558dd", fontWeight: "600", fontFamily: "inherit" },
  moodRow: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderTop: "1px solid #f0f0f8", flexWrap: "wrap", flexShrink: 0 },
  moodLabel: { fontSize: "12px", color: "#888", fontWeight: "600" },
  moodBtn: { background: "#f4f4ff", border: "1.5px solid #e4e4f8", borderRadius: "16px", padding: "4px 10px", fontSize: "12px", color: "#666", fontWeight: "600", fontFamily: "inherit" },
  moodBtnActive: { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "1.5px solid #6366f1", color: "white" },
  inputArea: { display: "flex", gap: "8px", padding: "12px 16px 16px", borderTop: "1px solid #f0f0f8", flexShrink: 0 },
  textarea: { flex: 1, background: "#f6f7ff", border: "1.5px solid #e4e4f8", borderRadius: "16px", padding: "10px 14px", fontSize: "14px", fontFamily: "inherit", color: "#2d2d4e", resize: "none", lineHeight: "1.5", fontWeight: "500" },
  sendBtn: { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", borderRadius: "16px", padding: "0 18px", fontSize: "14px", fontWeight: "800", whiteSpace: "nowrap" },
};
