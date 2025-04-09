import { useState } from "react";
import { X } from "lucide-react";
import emailjs from "@emailjs/browser";
import OtpInput from 'react-otp-input';

const SignupModal = ({ isOpen, onClose, onLoginClick, error, loading, handleSignup }) => {
  // Updated steps: EMAIL -> OTP -> USER_DETAILS -> COMPLETE
  
  const [currentStep, setCurrentStep] = useState('EMAIL');
  
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  

  const [password, setPassword] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [address, setAddress] = useState("");
  const [college, setCollege] = useState("");
  const [prn, setPrn] = useState("");

  if (!isOpen) return null;

  const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    
    const otpCode = generateOtp();
    setGeneratedOtp(otpCode);
    try {
      await emailjs.send(
        "service_mqpf8nm",
        "template_crqx9ui",
        {
          to_email: email,
          otp: otpCode,
        },
        "u6OXcc0z9aAA8FxQu"
      );
      setCurrentStep('OTP');
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (parseInt(otp) === generatedOtp) {
      setCurrentStep('USER_DETAILS');
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  const handleUserDetailsSubmit = (e) => {
    e.preventDefault();
    const userData = {
      name: fullName,
      email,
      password,
      mobileNo,
      address,
      college,
      prn
    };
    console.log(userData);
    handleSignup(userData);
    setCurrentStep('COMPLETE');
  };

  const renderEmailStep = () => (
    <form className="space-y-4" onSubmit={handleEmailSubmit}>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <div>
        <input
          type="text"
          placeholder="Full Name"
          className="w-full border-2 rounded p-2 outline-none focus:border-[#23e5db]"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div>
        <input
          type="email"
          placeholder="Email"
          className="w-full border-2 rounded p-2 outline-none focus:border-[#23e5db]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#002f34] text-white py-2 rounded hover:bg-[#003f44] disabled:opacity-50"
        disabled={isVerifying}
      >
        {isVerifying ? "Sending OTP..." : "Send OTP"}
      </button>
    </form>
  );

  const renderOtpStep = () => (
    <form className="space-y-4" onSubmit={handleOtpSubmit}>
      <div className="text-center text-gray-600 mb-4">
        Enter the 4-digit code sent to
        <div className="font-semibold">{email}</div>
      </div>
      
      <div className="flex justify-center my-8">
        <OtpInput
          value={otp}
          onChange={setOtp}
          numInputs={4}
          renderSeparator={<span className="w-4"></span>}
          renderInput={(props) => (
            <input
              {...props}
              className="!w-12 h-12 border-2 rounded text-center text-xl focus:border-[#23e5db] focus:outline-none"
            />
          )}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#002f34] text-white py-2 rounded hover:bg-[#003f44]"
      >
        Verify OTP
      </button>

      <div className="text-center space-y-2">
        <button
          type="button"
          className="text-[#002f34] text-sm hover:underline"
          onClick={() => {
            setCurrentStep('EMAIL');
            setOtp("");
          }}
        >
          Change Email
        </button>
        
        <div className="text-sm text-gray-600">
          Didn't receive the code?{" "}
          <button
            type="button"
            className="text-[#002f34] font-semibold hover:underline"
            onClick={handleEmailSubmit}
          >
            Resend OTP
          </button>
        </div>
      </div>
    </form>
  );

  const renderUserDetailsStep = () => (
    <form className="space-y-4" onSubmit={handleUserDetailsSubmit}>
      <div className="text-center text-gray-600 mb-4">
        Please complete your profile
      </div>
      
      <div>
        <input
          type="text"
          placeholder="Full Name"
          className="w-full border-2 rounded p-2 outline-none focus:border-[#23e5db]"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div>
        <input
          type="email"
          placeholder="Email"
          className="w-full border-2 rounded p-2 outline-none focus:border-[#23e5db]"
          value={email}
          disabled
          required
        />
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          className="w-full border-2 rounded p-2 outline-none focus:border-[#23e5db]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <input
          type="tel"
          placeholder="Mobile Number"
          className="w-full border-2 rounded p-2 outline-none focus:border-[#23e5db]"
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
          required
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Address"
          className="w-full border-2 rounded p-2 outline-none focus:border-[#23e5db]"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="College Name"
          className="w-full border-2 rounded p-2 outline-none focus:border-[#23e5db]"
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          required
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="PRN Number"
          className="w-full border-2 rounded p-2 outline-none focus:border-[#23e5db]"
          value={prn}
          onChange={(e) => setPrn(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#002f34] text-white py-2 rounded hover:bg-[#003f44]"
      >
        Complete Signup
      </button>
    </form>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#002f34]">
            {currentStep === 'EMAIL' && 'Sign Up'}
            {currentStep === 'OTP' && 'Verify OTP'}
            {currentStep === 'USER_DETAILS' && 'Complete Profile'}
          </h2>
          <button onClick={onClose}>
            <X size={24} className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {currentStep === 'EMAIL' && renderEmailStep()}
        {currentStep === 'OTP' && renderOtpStep()}
        {currentStep === 'USER_DETAILS' && renderUserDetailsStep()}

        {currentStep !== 'USER_DETAILS' && (
          <div className="mt-4 text-center text-gray-600">
            Already have an account?{" "}
            <button
              className="text-[#3a77ff] hover:underline font-semibold"
              onClick={onLoginClick}
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupModal;
