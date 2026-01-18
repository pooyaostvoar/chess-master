import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <Card className="overflow-hidden shadow-lg">
        {/* HEADER */}
        <CardHeader className="relative text-center pb-10 bg-gradient-to-br from-primary/10 via-background to-primary/5">
          <Badge className="absolute top-4 right-4">Legal</Badge>

          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
          <CardDescription className="mt-2 text-base">
            Last updated: {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="space-y-8 pt-8 text-muted-foreground leading-relaxed">
          {/* INTRO */}
          <section className="space-y-2">
            <h3 className="font-semibold text-primary">1. Introduction</h3>
            <p>
              ChessWithMasters ("we", "our", or "us") respects your privacy and
              is committed to protecting your personal data. This Privacy Policy
              explains how we collect, use, and safeguard your information when
              you use our platform.
            </p>
          </section>

          {/* DATA WE COLLECT */}
          <section className="space-y-2">
            <h3 className="font-semibold text-primary">
              2. Information We Collect
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email address and basic profile information</li>
              <li>Account role (student or teacher)</li>
              <li>Optional profile details provided by teachers</li>
              <li>Google account identifiers when signing in with Google</li>
            </ul>
          </section>

          {/* GOOGLE DATA */}
          <section className="space-y-2">
            <h3 className="font-semibold text-primary">3. Google Data Usage</h3>
            <p>
              Teachers may choose to connect their Google account to enable
              class scheduling.
            </p>
            <p>
              When a teacher grants Google Calendar access, we use it{" "}
              <strong>only</strong> to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Create lesson events in the teacher’s Google Calendar</li>
              <li>Generate a Google Meet link for the lesson</li>
            </ul>
            <p>
              We do <strong>not</strong> read, modify, or delete any other
              calendar events, and we do <strong>not</strong> share Google data
              with third parties.
            </p>
          </section>

          {/* DATA USE */}
          <section className="space-y-2">
            <h3 className="font-semibold text-primary">
              4. How We Use Your Information
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>To create and manage user accounts</li>
              <li>To connect students with teachers</li>
              <li>To schedule and manage online chess lessons</li>
              <li>To send transactional emails related to lessons</li>
            </ul>
          </section>

          {/* DATA SHARING */}
          <section className="space-y-2">
            <h3 className="font-semibold text-primary">5. Data Sharing</h3>
            <p>
              We do not sell or rent your personal data. Information is shared
              only when necessary to provide our services (for example, sharing
              lesson details between a student and their teacher).
            </p>
          </section>

          {/* DATA SECURITY */}
          <section className="space-y-2">
            <h3 className="font-semibold text-primary">6. Data Security</h3>
            <p>
              We take reasonable technical and organizational measures to
              protect your data against unauthorized access, loss, or misuse.
            </p>
          </section>

          {/* USER RIGHTS */}
          <section className="space-y-2">
            <h3 className="font-semibold text-primary">7. Your Rights</h3>
            <p>
              You may request access to, correction of, or deletion of your
              personal data at any time by contacting us.
            </p>
          </section>

          {/* CONTACT */}
          <section className="space-y-2">
            <h3 className="font-semibold text-primary">
              8. Contact Information
            </h3>
            <p>
              If you have questions about this Privacy Policy or our data
              practices, please contact us at:
            </p>
            <p className="font-semibold">support@chesswithmasters.com</p>
          </section>

          {/* ACTION */}
          <div className="flex justify-center pt-6">
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
