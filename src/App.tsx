import { useAuth } from "./context/AuthContext";

function App() {
  const { state } = useAuth();
  return <h1>Access Portal — {state.status}</h1>;
}

export default App;
