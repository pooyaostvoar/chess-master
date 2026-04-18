import React from "react";

const TermsOfService: React.FC = () => {
  return (
    <div className="bg-[#FAF5EB] min-h-screen">
      <div className="bg-[#F4ECDD] border-b border-[#1F1109]/[0.08]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
          <div
            className="text-xs italic text-[#7A2E2E] tracking-[0.04em] mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Legal
          </div>
          <h1
            className="text-2xl sm:text-3xl font-medium text-[#1F1109] leading-[1.1] tracking-[-0.01em]"
            style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
          >
            Terms of Service
          </h1>
          <p className="text-[13px] text-[#5C4631] mt-1.5">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
        <div className="bg-white border border-[#1F1109]/[0.12] rounded-xl p-6 sm:p-8 space-y-7 text-[13px] text-[#3D2817] leading-relaxed">
          <section className="space-y-2">
            <p>Welcome to <strong>Chess Master</strong> ("we", "our", or "us"). By accessing or using our website and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-[#1F1109]">1. Eligibility</h2>
            <p>You must be at least 13 years old to use our services. By using Chess Master, you confirm that you meet this requirement.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-[#1F1109]">2. Services Provided</h2>
            <p>Chess Master provides a platform that connects students with chess instructors ("Masters") for online lessons, scheduling, communication, and related services.</p>
            <p>We do not guarantee lesson outcomes, skill improvement, or availability of any specific instructor.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-[#1F1109]">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
            <p>You agree to provide accurate and up-to-date information during registration.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-[#1F1109]">4. Payments & Bookings</h2>
            <p>Payments, pricing, and lesson availability are determined by the individual Masters. Chess Master may charge a service fee where applicable.</p>
            <p>Refunds, cancellations, and rescheduling are subject to the policies defined on the platform or by the instructor.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-[#1F1109]">5. Prohibited Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the platform for unlawful purposes</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to access accounts or data without authorization</li>
              <li>Misuse the platform or interfere with its operation</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-[#1F1109]">6. Third-Party Services</h2>
            <p>Chess Master may integrate third-party services such as Google OAuth and Google Calendar. We are not responsible for the content or practices of these third-party services.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-[#1F1109]">7. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at our discretion if you violate these Terms or misuse the platform.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-[#1F1109]">8. Limitation of Liability</h2>
            <p>Chess Master is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-[#1F1109]">9. Changes to These Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the platform after changes means you accept the updated Terms.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-[#1F1109]">10. Contact Us</h2>
            <p>If you have any questions about these Terms, you can contact us at:</p>
            <p className="font-medium text-[#B8893D]">team@chesswithmasters.com</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
