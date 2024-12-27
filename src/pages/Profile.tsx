import { ProfileDetails } from "@/components/profile/ProfileDetails";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto">
        <div className="py-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          <ProfileDetails />
        </div>
      </main>
    </div>
  );
};

export default Profile;