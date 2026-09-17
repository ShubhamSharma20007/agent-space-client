import instance from "@/utils/axios";

class AuthService{
    public async login(idToken:string){
        return await instance.post("/auth/signin", { token: idToken })
        .then((res) => {
            return res.data?.data || res.data;
        }).catch((err) => {
            console.error("Error during login:", err);
            return null
        });

    }
    public async logout(){
       return await instance.get("/auth/signout")
        .then((res) => {
            return res.data?.data || res.data;
        }).catch((err) => {
            console.error("Error during logout:", err);
            return null
         
        });
    }
    public async getUser(){
        return await instance.get("/user")
        .then((res) => {
            return res.data?.data || res.data;
        }).catch((err) => {
            console.error("Error fetching user:", err);
            return null
        
        });
    }
}
export default new AuthService();