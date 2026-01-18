import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Terms of Service</CardTitle>
          <CardDescription>
            Last updated: {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 text-muted-foreground leading-relaxed">
          {/* INTRO */}
          <section className="space-y-2">
            <p>
              Welcome to <strong>Chess Master</strong> ("we", "our", or "us").
              By accessing or using our website and services, you agree to be
              bound by these Terms of Service. If you do not agree, please do
              not use the platform.
            </p>
          </section>

          {/* ELIGIBILITY */}
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-primary">
              1. Eligibility
            </h2>
            <p>
              You must be at least 13 years old to use our services. By using
              Chess Master, you confirm that you meet this requirement.
            </p>
          </section>

          {/* SERVICES */}
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-primary">
              2. Services Provided
            </h2>
            <p>
              Chess Master provides a platform that connects students with chess
              instructors ("Masters") for online lessons, scheduling,
              communication, and related services.
            </p>
            <p>
              We do not guarantee lesson outcomes, skill improvement, or
              availability of any specific instructor.
            </p>
          </section>

          {/* USER ACCOUNTS */}
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-primary">
              3. User Accounts
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account and for all activities that occur under your account.
            </p>
            <p>
              You agree to provide accurate and up-to-date information during
              registration.
            </p>
          </section>

          {/* PAYMENTS */}
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-primary">
              4. Payments & Bookings
            </h2>
            <p>
              Payments, pricing, and lesson availability are determined by the
              individual Masters. Chess Master may charge a service fee where
              applicable.
            </p>
            <p>
              Refunds, cancellations, and rescheduling are subject to the
              policies defined on the platform or by the instructor.
            </p>
          </section>

          {/* PROHIBITED USE */}
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-primary">
              5. Prohibited Use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the platform for unlawful purposes</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to access accounts or data without authorization</li>
              <li>Misuse the platform or interfere with its operation</li>
            </ul>
          </section>

          {/* THIRD-PARTY SERVICES */}
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-primary">
              6. Third-Party Services
            </h2>
            <p>
              Chess Master may integrate third-party services such as Google
              OAuth and Google Calendar. We are not responsible for the content
              or practices of these third-party services.
            </p>
          </section>

          {/* TERMINATION */}
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-primary">
              7. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your account at our
              discretion if you violate these Terms or misuse the platform.
            </p>
          </section>

          {/* LIMITATION OF LIABILITY */}
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-primary">
              8. Limitation of Liability
            </h2>
            <p>
              Chess Master is provided "as is" without warranties of any kind.
              We are not liable for any indirect, incidental, or consequential
              damages arising from your use of the platform.
            </p>
          </section>

          {/* CHANGES */}
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-primary">
              9. Changes to These Terms
            </h2>
            <p>
              We may update these Terms from time to time. Continued use of the
              platform after changes means you accept the updated Terms.
            </p>
          </section>

          {/* CONTACT */}
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-primary">
              10. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms, you can contact us
              at:
            </p>
            <p className="font-medium text-primary">
              support@chesswithmasters.com
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsOfService;
