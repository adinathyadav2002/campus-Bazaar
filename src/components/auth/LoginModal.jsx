import { X } from 'lucide-react';
import { auth, googleProvider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";
import { useState, useEffect, useContext } from 'react';
import {showToast} from '../ToastComponent';
import Loader from '../Loader';
import AppContext from '../../context/AppContext';

const LoginModal = ({ isOpen, onClose, onSignupClick, error, loading, handleLogin }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      image: "https://res.cloudinary.com/dailaa9bp/image/upload/v1741378898/uploads/ij8gkmqjw8zvduhiyiiq.jpg ",
      text: "Help us become one of the safest places to buy and sell"
    },
    {
      image: "https://res.cloudinary.com/dailaa9bp/image/upload/v1741378898/uploads/mldzl7pdy40wsr3eadux.jpg ",
      text: "Close deals from the comfort of your home"
    },
    {
      image: "https://res.cloudinary.com/dailaa9bp/image/upload/v1741378898/uploads/jcrcsfpzsueuvdeanphr.jpg ",
      text: "Keep all your favourites in one place"
    }
  ];

  const [load,setLoad] = useState(false);

  const {setLogin} = useContext(AppContext);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoad(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      let url = String(process.env.REACT_APP_BACKEND)
      url += '/api/auth/google'
      // Send user data to backend
      const response = await axios.post(url, {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      });

      
      if(response.data.status){
        setLogin(true);
        localStorage.setItem('token',response.data.token);
        showToast(response.data.message,'success');
        onClose();
      }else{
        showToast(response.data.message,'error');
      }
    } catch (error) {
      showToast("Something went wrong","error");
      console.error("Google Sign-in Error:", error);
    }
    finally{
      setLoad(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#002f34]">Login</h2>
          <button onClick={onClose}>
            <X size={24} className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <div className="relative mb-6">
  {/* Image Container */}
  <div className="h-48 overflow-hidden rounded-full mb-4 relative">
    {slides.map((slide, index) => (
      <div
        key={index}
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
          index === currentSlide ? "opacity-100" : "opacity-0"
        }`}
      >
        <img
          src={slide.image}
          alt={slide.text}
          className="w-full h-full object-contain"
        />
      </div>
    ))}
  </div>

  {/* Text */}
  <div className="text-center mt-4"> {/* Added margin-top for spacing */}
    <p className="text-gray-700 font-semibold">{slides[currentSlide].text}</p>
  </div>
</div>


        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={load}
          className="w-full bg-white text-gray-700 p-3 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center justify-center gap-2 border border-gray-300"
        >
          {
            !load &&
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />
          }
          {load ? <Loader/> : 'Login with Google' }
        </button>
      </div>
    </div>
  );
};

export default LoginModal; 