import { motion } from "framer-motion";
import { useInView } from "../hooks/UseInView";
import "../styles/contact.css";

export default function Contact() {
  const { ref, isVisible } = useInView();

  return (
    <motion.section
      ref={ref}
      className="contact"
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <h2>Contact Us</h2>
      <motion.div
        className="contact-container"
        initial={{ opacity: 0, y: 50 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="contact-card"
          initial={{ opacity: 0, x: -50 }}
          animate={isVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h3>Get in Touch</h3>
          <form>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <input type="text" placeholder="Subject" required />
            <textarea placeholder="Message" required></textarea>
            <button type="submit">Send Message</button>
          </form>
        </motion.div>

        <motion.div
          className="contact-card"
          initial={{ opacity: 0, x: 50 }}
          animate={isVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h3>Find Us</h3>
          <p>
            206, Faculty Of Computer Application & Information Technology,
            Ahmedabad-380001
          </p>
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.9243206047304!2d72.55662027282354!3d23.026550779170954!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f07cf71307%3A0x804503470ffe80ea!2sGLS%20University!5e0!3m2!1sen!2sin!4v1738572344225!5m2!1sen!2sin"
            width="100%"
            height="250"
            style={{ border: 0 }}
            allowFullScreen
          ></iframe>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
