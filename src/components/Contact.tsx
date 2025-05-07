import { motion } from "framer-motion";
import { useInView } from "../hooks/UseInView";

export default function Contact() {
  const { ref, isVisible } = useInView();

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="bg-primary text-background text-center py-12 px-6"
    >
      <h2 className="text-3xl font-bold mb-6">Contact Us</h2>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-5xl mx-auto"
      >
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="bg-background text-primary p-6 rounded-lg shadow-lg w-full md:w-1/2"
        >
          <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your Name"
              required
              className="border border-secondary p-2 rounded-md"
            />
            <input
              type="email"
              placeholder="Your Email"
              required
              className="border border-secondary p-2 rounded-md"
            />
            <input
              type="text"
              placeholder="Subject"
              required
              className="border border-secondary p-2 rounded-md"
            />
            <textarea
              placeholder="Message"
              required
              className="border border-secondary p-2 rounded-md h-24"
            ></textarea>
            <button
              type="submit"
              className="bg-primary text-white py-3 rounded-md transition hover:bg-secondary"
            >
              Send Message
            </button>
          </form>
        </motion.div>

        {/* Contact Address & Map */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="bg-background text-primary p-6 rounded-lg shadow-lg min-h-auto w-full md:w-1/2"
        >
          <h3 className="text-xl font-semibold mb-4">Find Us</h3>
          <p className="mb-4">
            206, Faculty Of Computer Application & Information Technology,
            Ahmedabad-380001
          </p>
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.9243206047304!2d72.55662027282354!3d23.026550779170954!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f07cf71307%3A0x804503470ffe80ea!2sGLS%20University!5e0!3m2!1sen!2sin!4v1738572344225!5m2!1sen!2sin"
            width="100%"
            height="250"
            className="border-none mb-4"
            allowFullScreen
          ></iframe>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
