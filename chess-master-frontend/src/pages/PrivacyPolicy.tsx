import React from "react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

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
            Privacy Policy
          </h1>
          <p className="text-[13px] text-[#5C4631] mt-1.5">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
        <div className="bg-white border border-[#1F1109]/[0.12] rounded-xl p-6 sm:p-8 space-y-7 text-[13px] text-[#3D2817] leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-medium text-[#1F1109]">1. Introduction</h3>
            <p>ChessWithMasters ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-medium text-[#1F1109]">2. Information We Collect</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email address and basic profile information</li>
              <li>Account role (student or teacher)</li>
              <li>Optional profile details provided by teachers</li>
              <li>Google account identifiers when signing in with Google</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-medium text-[#1F1109]">3. Google Data Usage</h3>
            <p>Teachers may choose to connect their Google account to enable class scheduling.</p>
            <p>When a teacher grants Google Calendar access, we use it <strong>only</strong> to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Create lesson events in the teacher's Google Calendar</li>
              <li>Generate a Google Meet link for the lesson</li>
            </ul>
            <p>We do <strong>not</strong> read, modify, or delete any other calendar events, and we do <strong>not</strong> share Google data with third parties.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-medium text-[#1F1109]">4. How We Use Your Information</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>To create and manage user accounts</li>
              <li>To connect students with teachers</li>
              <li>To schedule and manage online chess lessons</li>
              <li>To send transactional emails related to lessons</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-medium text-[#1F1109]">5. Data Sharing</h3>
            <p>We do not sell or rent your personal data. Information is shared only when necessary to provide our services (for example, sharing lesson details between a student and their teacher).</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-medium text-[#1F1109]">6. Data Security</h3>
            <p>We take reasonable technical and organizational measures to protect your data against unauthorized access, loss, or misuse.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-medium text-[#1F1109]">7. Your Rights</h3>
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-medium text-[#1F1109]">8. Contact Information</h3>
            <p>If you have questions about this Privacy Policy or our data practices, please contact us at:</p>
            <p className="font-medium text-[#B8893D]">support@chesswithmasters.com</p>
          </section>

          <div className="pt-4 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-xs text-[#B8893D] font-medium hover:underline"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
