import { ProfileDetails } from "@/components/profile/ProfileDetails";
import Header from "@/components/Header";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto">
        <ProfileDetails />
      </main>
    </div>
  );
};

export default Profile;