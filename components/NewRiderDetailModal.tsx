import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import eucImage from "figma:asset/dd376d90b377bfc03eae7bc1a709fc97eea639ec.png";
import glovesImage from "figma:asset/35234fdcb0f45c1fbf700378c4a5bc67dced65be.png";
import kneeGuardsImage from "figma:asset/5beb307f37aaa6d88bfe36669b45bc4063af166f.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";

interface NewRiderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: "euc" | "safety" | "start" | "laws" | null;
  onContactClick?: () => void;
}

export function NewRiderDetailModal({
  isOpen,
  onClose,
  section,
  onContactClick,
}: NewRiderDetailModalProps) {
  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    if (onContactClick) {
      // Small delay to allow modal to close smoothly
      setTimeout(() => {
        onContactClick();
      }, 100);
    }
  };

  const getContent = () => {
    switch (section) {
      case "euc":
        return {
          title: "What is an EUC?",
          description:
            "Learn about electric unicycles and how they work",
          content: (
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-[#1E293B]">
                  An Electric Unicycle (EUC) is a self-balancing
                  personal electric vehicle consisting of a
                  single wheel with electric motors, batteries,
                  and gyroscopic sensors enclosed within the
                  wheel housing. The rider stands on footpads on
                  either side of the wheel and controls the
                  device through body movements and weight
                  shifts.
                </p>
                <h4 className="text-[#1E293B] font-semibold">
                  How It Works
                </h4>
                <p className="text-[#1E293B]">
                  EUCs use advanced gyroscopic sensors and
                  accelerometers to detect the rider's balance
                  and lean angle. When you lean forward, the
                  electric motor accelerates to keep you
                  balanced. Leaning backward causes deceleration
                  and braking. Turning is achieved by leaning to
                  the left or right.
                </p>

                {/* Tech Specs and Why Ride with Image on Right */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-[#1E293B] font-semibold mb-3">
                        Technical Specifications
                      </h4>
                      <ul className="list-disc list-inside space-y-2 text-[#1E293B]">
                        <li>
                          <strong>Motor Power:</strong> Ranges from
                          500W to 5000W+ depending on the model
                        </li>
                        <li>
                          <strong>Battery:</strong> Lithium-ion
                          batteries, anywhere from 500Wh to 4800Wh
                          capacity
                        </li>
                        <li>
                          <strong>Speed:</strong> Most models can
                          reach 30-45 mph (advanced riders only)
                        </li>
                        <li>
                          <strong>Range:</strong> 20-100+ miles per
                          charge depending on battery size and riding
                          style
                        </li>
                        <li>
                          <strong>Weight:</strong> 35-120 lbs
                          depending on battery size and wheel diameter
                        </li>
                        <li>
                          <strong>Wheel Size:</strong> Common sizes
                          include 14", 16", 18", 20", and 22"
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-[#1E293B] font-semibold mb-3">
                        Why Ride an EUC?
                      </h4>
                      <p className="text-[#1E293B]">
                        EUCs offer unparalleled maneuverability,
                        portability, and range compared to other
                        personal electric vehicles. They're perfect
                        for urban commuting, recreational riding, and
                        exploring your city in a whole new way. Plus,
                        the learning curve and mastery process creates
                        an incredibly rewarding and engaged community.
                      </p>
                    </div>
                  </div>

                  {/* Image on right side */}
                  <div className="md:w-1/3 flex items-start justify-center md:justify-end">
                    <img
                      src={eucImage}
                      alt="Electric Unicycle close-up"
                      className="w-full max-w-[300px] h-auto object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          ),
        };

      case "safety":
        return {
          title: "Safety is Non-Negotiable",
          description:
            "Protective gear is essential for safe riding",
          content: (
            <div className="space-y-6">
              <p className="text-[#1E293B]">
                Safety gear is absolutely essential when riding
                an EUC. We strongly
                recommend investing in quality protective
                equipment from day one. Here's what we
                recommend:
              </p>

              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-[#ECFDF5] border border-[#10B981] rounded-lg p-6 inline-block">
                    <h4 className="text-[#1E293B] font-semibold mb-3 text-center">
                      Helmet - Your Most Important Investment
                    </h4>
                    <p className="text-[#1E293B] mb-3">
                      We strongly recommend{" "}
                      <strong>
                        ECE and/or DOT certified full-face helmets
                      </strong>
                      . These certifications ensure the helmet
                      meets rigorous safety standards for impact
                      protection.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-[#1E293B]">
                      <li>
                        Look for ECE 22.06 certification for
                        maximum protection
                      </li>
                      <li>
                        Full-face design protects your jaw and
                        chin in forward falls
                      </li>
                      <li>
                        Popular brands: Shoei, HJC, Scorpion,
                        Sedici, Icon, Fox
                      </li>
                      <li>
                        Budget: $150-600+ (don't compromise on
                        this)
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <h4 className="text-[#1E293B] font-semibold mb-3">
                        Knee and Shin Guards
                      </h4>
                      <p className="text-[#1E293B] mb-3">
                        Community recommended:{" "}
                        <strong>
                          Leatt Knee & Shin Guard Dual Axis Pro
                        </strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-[#1E293B]">
                        <li>
                          Full knee and shin protection for
                          forward falls
                        </li>
                        <li>
                          Dual-axis hinges for natural movement
                          while riding
                        </li>
                        <li>
                          Hard shell outer with foam padding for
                          comfort
                        </li>
                        <li>Budget: $80-120</li>
                      </ul>
                    </div>
                    <div className="w-48 flex-shrink-0 mr-12">
                      <img
                        src={kneeGuardsImage}
                        alt="Leatt Knee & Shin Guard Dual Axis Pro"
                        className="w-full h-auto object-contain rounded"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <h4 className="text-[#1E293B] font-semibold mb-3">
                        Gloves/Wrist Guards
                      </h4>
                      <p className="text-[#1E293B] mb-3">
                        Community recommended:{" "}
                        <strong>eRides Max P3 Riding Gloves</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-[#1E293B]">
                        <li>
                          Palm skid sliders to prevent grab and
                          scaphoid injuries
                        </li>
                        <li>
                          Specifically designed for electric
                          unicycle falls
                        </li>
                        <li>
                          Leather on palm of the gloves for better
                          abrasion resistance and palm protection
                        </li>
                        <li>Budget: $60-80</li>
                      </ul>
                    </div>
                    <div className="w-48 flex-shrink-0 mr-12">
                      <img
                        src={glovesImage}
                        alt="eRides Max P3 Riding Gloves"
                        className="w-full h-auto object-contain rounded"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-lg p-6">
                  <h4 className="text-[#1E293B] font-semibold mb-3">
                    Additional Gear to Consider
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-[#1E293B]">
                    <li>
                      <strong>Elbow pads:</strong> Protect your
                      elbows in side falls
                    </li>
                    <li>
                      <strong>Armored jacket:</strong> Back and
                      shoulder protection for advanced riders
                    </li>
                    <li>
                      <strong>Sturdy footwear:</strong> Ankle
                      protection and sole grip are important
                    </li>
                  </ul>
                </div>
              </div>

              <p className="text-[#1E293B] font-semibold text-center">
                Remember: Full gear every ride, no exceptions.
                Your safety is worth the investment.
              </p>
            </div>
          ),
        };

      case "start":
        return {
          title: "How to Start Riding",
          description: "Guides and tips for new riders",
          content: (
            <div className="space-y-6">
              <p className="text-[#1E293B]">
                Learning to ride an EUC takes practice,
                patience, and the right approach.{" "}
                <button 
                  onClick={handleContactClick} 
                  className="text-[#10B981] hover:underline font-medium focus:outline-none"
                >
                  Reach out to the community or to us
                </button>{" "}
                to support you every step of the way!
              </p>

              <div className="space-y-4">
                <div className="bg-[#ECFDF5] border border-[#10B981] rounded-lg p-6">
                  <h4 className="text-[#1E293B] font-semibold mb-3">
                    Community Support
                  </h4>
                  <p className="text-[#1E293B] mb-3">
                    You don't need to buy a wheel to get
                    started! We offer:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#1E293B]">
                    <li>
                      <strong>Wheel lending:</strong> Community
                      members often lend beginner-friendly
                      wheels to newcomers
                    </li>
                    <li>
                      <strong>In-person coaching:</strong>{" "}
                      Experienced riders volunteer to teach
                      proper technique
                    </li>
                    <li>
                      <strong>Practice sessions:</strong>{" "}
                      Organized beginner practice meetups in
                      safe areas
                    </li>
                    <li>
                      <strong>Ongoing support:</strong> Active
                      community chat and forums for questions
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="text-[#1E293B] font-semibold mb-3">
                    Best Wheels for Learning
                  </h4>
                  <p className="text-[#1E293B] mb-3">
                    When you're ready to get your own wheel,
                    these are excellent beginner choices:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#1E293B]">
                    <li>
                      <strong>Inmotion V10F:</strong> Affordable,
                      lightweight, perfect for learning basics
                    </li>
                    <li>
                      <strong>Inmotion V8F:</strong> Great
                      balance of price and capability for kids
                    </li>
                    <li>
                      <strong>Begode A2:</strong> Excellent
                      for teaching and learning on
                    </li>
                    <li>
                      <strong>King Song 16X:</strong> Popular
                      choice that you won't outgrow quickly
                    </li>
                  </ul>
                  <p className="text-[#1E293B] mt-3">
                    <strong>Budget:</strong> $600-1500 for a
                    quality beginner wheel
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="text-[#1E293B] font-semibold mb-3">
                    The Learning Process
                  </h4>
                  <p className="text-[#1E293B] mb-3">
                    Most riders can get the basics down in 1-4
                    hours of practice:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#1E293B]">
                    <li>
                      <strong>Session 1:</strong> Mounting,
                      basic balance, short distances with
                      support
                    </li>
                    <li>
                      <strong>Session 2-3:</strong> Independent
                      riding, turning, gradual speed increases
                    </li>
                    <li>
                      <strong>Session 4+:</strong> Building
                      confidence, longer distances, varied
                      terrain
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="text-[#1E293B] font-semibold mb-3">
                    Practice Tips
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-[#1E293B]">
                    <li>
                      Find a large, smooth, flat area (empty
                      parking lots work great)
                    </li>
                    <li>
                      Use a wall or fence for support when first
                      mounting
                    </li>
                    <li>
                      Wear full protective gear from your very
                      first attempt
                    </li>
                    <li>
                      Practice in short sessions to avoid
                      fatigue and frustration
                    </li>
                    <li>
                      Focus on relaxation - tension makes
                      balancing harder
                    </li>
                    <li>
                      Join beginner group rides to learn from
                      others
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#ECFDF5] border border-[#10B981] rounded-lg p-6 text-center">
                <p className="text-[#1E293B] font-semibold mb-2">
                  Ready to Start?
                </p>
                <div className="text-[#1E293B] flex flex-col gap-1">
                  <p>
                    <button 
                      onClick={handleContactClick}
                      className="text-[#10B981] hover:underline font-medium focus:outline-none"
                    >
                      Reach out to the community or to us!
                    </button>
                  </p>
                  <p>
                    We'd love to help you get started with a borrowed
                    wheel and personalized coaching.
                  </p>
                </div>
              </div>
            </div>
          ),
        };

      case "laws":
        return {
          title: "Boston Riding Laws & Regulations",
          description:
            "Know where you can ride and speed limits",
          content: (
            <div className="space-y-6">
              <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-lg p-6">
                <p className="text-[#1E293B] font-semibold mb-2">
                  ⚠️ Important: Legal Status
                </p>
                <p className="text-[#1E293B]">
                  Electric unicycles exist in a legal gray area
                  in Boston and Massachusetts. They are not
                  explicitly legal or illegal, but understanding
                  local regulations and riding responsibly is
                  crucial for the community's future.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#ECFDF5] border border-[#10B981] rounded-lg p-6">
                  <h4 className="text-[#1E293B] font-semibold mb-3">
                    Where You Can Ride
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-[#1E293B]">
                    <li>
                      <strong>Bike lanes:</strong> Generally the
                      safest and most appropriate place to ride
                    </li>
                    <li>
                      <strong>Shared-use paths:</strong>{" "}
                      Multi-use paths like the Charles River
                      Esplanade (ride courteously, yield to
                      pedestrians)
                    </li>
                    <li>
                      <strong>Roads:</strong> Legal on most
                      roads, follow traffic laws and use bike
                      lanes where available
                    </li>
                    <li>
                      <strong>Parks:</strong> Many parks allow
                      EUCs on paved paths, but check specific
                      park rules
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="text-[#1E293B] font-semibold mb-3">
                    Where You Should NOT Ride
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-[#1E293B]">
                    <li>
                      <strong>Sidewalks:</strong> Avoid riding
                      on sidewalks in busy areas - this draws
                      negative attention and can be dangerous
                      for pedestrians
                    </li>
                    <li>
                      <strong>Private property:</strong> Respect
                      no-trespassing signs and private areas
                    </li>
                    <li>
                      <strong>Highways/Interstates:</strong>{" "}
                      Never ride on highways or high-speed
                      roadways
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="text-[#1E293B] font-semibold mb-3">
                    Speed Limits & Recommendations
                  </h4>
                  <p className="text-[#1E293B] mb-3">
                    While there are no specific EUC speed
                    limits, follow these community guidelines:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-[#1E293B]">
                    <li>
                      <strong>
                        Shared paths with pedestrians:
                      </strong>{" "}
                      10-15 mph maximum, slower when crowded
                    </li>
                    <li>
                      <strong>Bike lanes:</strong> Match traffic
                      speed, typically 15-20 mph in urban areas
                    </li>
                    <li>
                      <strong>Roads:</strong> Follow posted
                      speed limits, don't exceed traffic flow
                    </li>
                    <li>
                      <strong>High-speed riding:</strong> Only
                      on appropriate roads with minimal
                      pedestrian traffic
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="text-[#1E293B] font-semibold mb-3">
                    Best Practices for the Community
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-[#1E293B]">
                    <li>
                      <strong>Be courteous:</strong> Yield to
                      pedestrians, announce when passing, ride
                      predictably
                    </li>
                    <li>
                      <strong>Wear safety gear:</strong> Visible
                      gear helps legitimize EUCs as serious
                      transportation
                    </li>
                    <li>
                      <strong>Follow traffic laws:</strong> Stop
                      at red lights, use hand signals, obey
                      signs
                    </li>
                    <li>
                      <strong>Don't show off:</strong> Excessive
                      speed or tricks in public draw negative
                      attention
                    </li>
                    <li>
                      <strong>Be an ambassador:</strong> Your
                      behavior represents the entire EUC
                      community
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="text-[#1E293B] font-semibold mb-3">
                    If Stopped by Police
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-[#1E293B]">
                    <li>Be respectful and cooperative</li>
                    <li>
                      Explain that EUCs are legal personal
                      transportation devices
                    </li>
                    <li>
                      Most officers are unfamiliar with EUCs and
                      are generally understanding
                    </li>
                    <li>
                      If ticketed, document the incident and
                      share with the community
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#ECFDF5] border border-[#10B981] rounded-lg p-6 text-center">
                <p className="text-[#1E293B] font-semibold mb-2">
                  Ride Responsibly
                </p>
                <div className="text-[#1E293B] flex flex-col gap-1">
                  <p>The future of EUC riding in Boston depends on riders demonstrating responsibility, courtesy, and safety.</p>
                  <p>Help keep our community in good standing!</p>
                </div>
              </div>
            </div>
          ),
        };

      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-w-[calc(100%-2rem)] max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Sticky Header with Close Button */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-xs opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2"
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </button>
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#1E293B] text-center pr-8">
              {content.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#6B7280]">
              {content.description}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 pb-6 pt-4">
          {content.content}
        </div>
      </DialogContent>
    </Dialog>
  );
}