"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setAuthState, setUserDetailsState } from "@/store/authSlice";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import Spinner from "../../../components/Spinner/Spinner";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const dispatch = useDispatch();
  const router = useRouter();

  const handleAuth = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      
      // Sign-in with Google popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // If the user already exists, merge user details
        await setDoc(
          userRef,
          {
            userDetails: {
              email: user.email,
              name: user.displayName,
              profilePic: user.photoURL,
            },
          },
          { merge: true }
        );
      } else {
        // If new user, create a new document with user details
        await setDoc(userRef, {
          userDetails: {
            email: user.email,
            name: user.displayName,
            profilePic: user.photoURL,
            createdAt: serverTimestamp(),
          },
        });
      }

      // Dispatch authentication state and user details to Redux store
      dispatch(setAuthState(true));
      dispatch(
        setUserDetailsState({
          uid: user.uid,
          name: user.displayName ?? "",
          email: user.email ?? "",
          profilePic: user.photoURL ?? "",
        })
      );

      setIsLoggedIn(true); // Update login state to show the thank you message
      console.log("Login successful, user details:", user);
    } catch (error) {
      console.log("Error signing in:", error);
    } finally {
      setLoading(false);  // Stop loading spinner after the process is done
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f4ef] flex flex-col items-center px-4">
      <div className="w-full max-w-[440px] mt-8">
        <div className="flex items-center gap-2 mb-24">
          <Sparkles className="w-6 h-6 text-[#E07C54]" />
          <span
            className="text-[1.7rem] text-[#29261B] font-[510]"
            style={{
              fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
            }}
          >
            Omniplex
          </span>
        </div>

        <div className="space-y-2 mb-8">
          <h1
            className="text-[2.75rem] leading-[1.2] tracking-[-0.02em] text-[#29261B] font-serif"
            style={{
              fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
            }}
          >
            Your ideas,<br />amplified
          </h1>
          <p className="text-[#4E4E4E] text-lg">
            Privacy-first AI that helps you create in confidence.
          </p>
        </div>

        <div className="bg-[#F5F4EF] rounded-2xl p-6 shadow-sm border border-[#D4D2C9]">
          {/* Google Sign-in Button */}
          <Button
            variant="outline"
            className="w-full mb-6 h-11 text-[#4E4E4E] font-normal bg-[#FEFEFD] border-[#FEFEFD] hover:border-[#E5E5E5]"
            onClick={handleAuth}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Spinner />
                <span className="ml-2">Signing in...</span>
              </div>
            ) : (
              <>
                <Image
                  src={"/svgs/Google.svg"}
                  alt={"Google"}
                  width={24}
                  height={24}
                />
                Continue with Google
              </>
            )}
          </Button>

          <div className="relative mb-6">
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#F5F4EF] px-4 text-[#4E4E4E]">OR</span>
            </div>
          </div>

          {/* Email Input Box */}
          <Input
            type="email"
            placeholder="Enter your personal or work email"
            className="mb-4 h-11 text-[#8D7163] bg-[#F8F8F7] font-normal border-[#737163] focus:ring-2 focus:ring-[#C45D3E]"
          />

          {/* Continue with Email Button */}
          <Button className="w-full bg-[#C45D3E] hover:bg-[#B34D2E] h-11">
            Continue with email
          </Button>

          <div className="mt-6 text-center text-sm text-[#4E4E4E]">
            By continuing, you agree to Anthropic's{" "}
            <Link href="#" className="underline">
              Consumer Terms
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline">
              Usage Policy
            </Link>
            , and acknowledge their{" "}
            <Link href="#" className="underline">
              Privacy Policy
            </Link>
            .
          </div>
        </div>

        {/* Display Thank You message and Redirect Button after login */}
        {isLoggedIn && (
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-semibold text-[#29261B]">Thank you for logging in!</h2>
            <p className="text-[#4E4E4E] text-lg mt-4">You can now proceed to the homepage.</p>
            <Link href="/" passHref>
              <Button className="mt-6 bg-[#C45D3E] hover:bg-[#B34D2E]">
                Go to Homepage
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
