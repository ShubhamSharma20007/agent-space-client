import type { CreateOrder, VerifyPayment } from "@/types/chat"
import instance from "@/utils/axios"
class PlanService{
   async createPlan(payload:CreateOrder){
     return await instance.post(`/billing/create-order`,payload)
    .then(res=>{
          return res.data?.data || res.data
    })
    .catch(err=>{
      console.log('Error error in create plan',err)
    })
    }

     async verifyPayment(payload:VerifyPayment){
     return await instance.post(`/billing/verify-payment`,payload)
    .then(res=>{
          return res.data?.data || res.data
    })
    .catch(err=>{
      console.log('Error error in verify payment',err)
    })
    }
}

export default new PlanService()