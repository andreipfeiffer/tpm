import { NextPage } from "next";
import { useState } from "react";
import { Layout } from "../components/layout";
import jwt from "jsonwebtoken";

const Page: NextPage = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("You are not logged in");
  const [currentUser, setCurrentUser] = useState<string>("");

  async function handleSubmit() {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then((data) => data.json());

    const token = res.authToken;

    if (token) {
      const json = jwt.decode(token) as { [key: string]: string };
      setMessage(`Welcome, user ${json.id}.`);
      setCurrentUser(json.id);
    } else {
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <Layout>
      <h2>{message}</h2>
      {!currentUser && (
        <form>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br></br>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br></br>
          <input type="button" value="Login" onClick={handleSubmit} />
        </form>
      )}
      {currentUser && <p>Private account area</p>}
    </Layout>
  );
};

export default Page;
