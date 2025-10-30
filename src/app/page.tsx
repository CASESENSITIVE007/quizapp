
import LoginPage from "./login/page";
import SignupPage from "./signup/page";
import ProfilePage from "./profile/page";
export default async function Home() {
  
  return (

    <div >
      <LoginPage/>
      <SignupPage/>
      <ProfilePage/>
    </div>
  );
}
