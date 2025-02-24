import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-background text-gray-100 px-8 py-6 flex flex-wrap justify-between items-center gap-8">
      {/* Voxhire Info Section */}
      <div className="flex-1 min-w-[250px]">
        <h3 className="text-lg font-bold">Voxhire</h3>
        <p className="text-sm">
          206, Faculty Of Computer Application & Information Technology,
          Ahmedabad-380001
        </p>
        <p className="text-sm">
          <strong>Phone:</strong> +91 12345 67890
        </p>
        <p className="text-sm">
          <strong>Email:</strong> voxhire25@gmail.com
        </p>
      </div>

      {/* Useful Links Section */}
      <div className="flex-1 min-w-[250px]">
        <h4 className="text-md font-semibold">Useful Links</h4>
        <ul className="mt-2 space-y-1 text-sm">
          <li>
            <a href="#" className="hover:underline">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              About Us
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              Services
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              Terms of Service
            </a>
          </li>
        </ul>
      </div>

      {/* Social Media Section */}
      <div className="flex-1 min-w-[250px] text-left">
        <h4 className="text-md font-semibold">Follow Us</h4>
        <div className="flex gap-4 mt-3">
          <a href="#" className="hover:scale-110 transition">
            <Facebook className="w-6 h-6 text-gray-100 hover:text-gray-300" />
          </a>
          <a href="#" className="hover:scale-110 transition">
            <Twitter className="w-6 h-6 text-gray-100 hover:text-gray-300" />
          </a>
          <a href="#" className="hover:scale-110 transition">
            <Instagram className="w-6 h-6 text-gray-100 hover:text-gray-300" />
          </a>
        </div>
      </div>
    </footer>
  );
}
