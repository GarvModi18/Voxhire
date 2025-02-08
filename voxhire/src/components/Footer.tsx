import "../styles/footer.css";
import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-section">
        <h3>Voxhire</h3>
        <p>
          206, Faculty Of Computer Application & Information Technology,
          Ahmedabad-380001
        </p>
        <p>
          <strong>Phone:</strong> +91 12345 67890
        </p>
        <p>
          <strong>Email:</strong> voxhire25@gmail.com
        </p>
      </div>
      <div className="footer-section">
        <h4>Useful Links</h4>
        <ul>
          <li>
            <a href="#">Home</a>
          </li>
          <li>
            <a href="#">About Us</a>
          </li>
          <li>
            <a href="#">Services</a>
          </li>
          <li>
            <a href="#">Terms of Service</a>
          </li>
        </ul>
      </div>
      <div className="footer-section">
        <h4 className="follow">Follow Us</h4>
        <div className="social-icons">
          <a href="#">
            <Facebook className="icon" />
          </a>
          <a href="#">
            <Twitter className="icon" />
          </a>
          <a href="#">
            <Instagram className="icon" />
          </a>
        </div>
      </div>
    </footer>
  );
}
