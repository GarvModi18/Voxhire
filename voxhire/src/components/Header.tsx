import { Link } from "react-router-dom";
import DefaultProfile from "../icons/default-profile.png";
export default function Header({
  user,
  onProfileClick,
}: {
  user: { name: string; profilePic: string } | null;
  onProfileClick: () => void;
}) {
  return (
    <header className="container">
      <div className="text-2xl font-bold">Voxhire</div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
      </nav>
      {user ? (
        <div className="profile" onClick={onProfileClick}>
          <img
            src={user.profilePic || DefaultProfile}
            alt="Profile"
            className="profile-pic"
          />
          <span>{user.name}</span>
        </div>
      ) : (
        <Link to="/login" className="login-btn">
          Login
        </Link>
      )}
    </header>
  );
}
