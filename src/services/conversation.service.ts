import instance from "@/utils/axios";

class ConversationService {
  async getConversations() {
    return await instance.get('/chat/get-conversation')
    .then(res=>{
          return res.data?.data || res.data
    })
    .catch(err=>{
      console.log('get conversations error',err)
    })
  }

  async getConversationById(id: string) {
    return await instance.get(`/chat/get-conversation/${id}`)
    .then(res=>{
          return res.data?.data || res.data
    })
    .catch(err=>{
      console.log('get conversations by id error',err)
    })
  }

  async createConversation() {
    return await instance.post('/chat/create-conversation')
    .then(res=>{
          return res.data?.data || res.data
    })
    .catch(err=>{
      console.log('create conversations error',err)
    })
  }

  async updateConversation(conversationId: string, title: string) {
    return await instance.patch(`/chat/update-conversation/${conversationId}`, {title})
    .then(res=>{
          return res.data?.data || res.data
    })
    .catch(err=>{
      console.log('update conversations error',err)
    })
  }


}
export default new ConversationService();