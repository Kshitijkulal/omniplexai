import Link from "next/link";
import Image from "next/image";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col items-center px-4">
      <div className="w-full max-w-[440px] mt-8">
        <div className="flex items-center gap-2 mb-24">
          <Sparkles className="w-6 h-6 text-[#E07C54]" />
          <span className="text-[1.7rem] text-[#29261B] font-[510]" style={{ fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif" }}>Omniplex</span>
        </div>

        <div className="space-y-2 mb-8">
          <h1 className="text-[2.75rem] leading-[1.2] tracking-[-0.02em] text-[#29261B] font-serif" style={{ fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif" }}>
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
          >
            <Image
              src={"/svgs/Google.svg"}
              alt={"Google"}
              width={24}
              height={24}
            />
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              {/* <div className="w-full border-t border-[#E5E5E5]"></div> */}
            </div>
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
            </Link>
            {" "}and{" "}
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
      </div>
    </div>
  );
}
