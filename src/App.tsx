import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { Home } from "./components/Home";
import { UsersLayout } from "./components/users/UsersLayout";
import { UserList } from "./components/users/UserList";
import { UserDetail } from "./components/users/UserDetail";
import { NavBar } from "./components/NavBar";

function App(): JSX.Element {
  return (
    <UserProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<UsersLayout />}>
            <Route index element={<UserList />} />
            <Route path=":id" element={<UserDetail />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;