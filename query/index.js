const express = require('express')
const cors = require('cors')
const axios =require('axios')
const app = express()
app.use(cors())
app.use(express.json())

const posts = {}

const handleEvent = (type,data)=>{
    if(type==='PostCreated'){
        const {id, title} = data
        posts[id] = {id,title, comments:[]}
    }
    else if(type==='CommentCreated'){
        const {id, content, postId, status} = data
        posts[postId].comments.push({id, content, status})
    }
    else if (type ==='CommentUpdated'){
        const {id, content, postId, status} = data

        const post = posts[postId]

        const comment = post.comments.find(comment=> comment.id ===id)

        comment.status = status
        comment.content = content

    }
}

app.get('/posts', (req,res)=>{
    res.send(posts)
})

app.post('/events',(req,res)=>{
    const {type, data} = req.body

    handleEvent(type,data)
    console.log(posts)
    res.send({})
})

app.listen(4002, async ()=>{
    try{
        console.log('Listening on 4002')
        const res = await axios.get('http://event-bus-srv:4005/events')

        for (let event of res.data){
            console.log('Processing event:', event.type)

            handleEvent(event.type, event.data)
        }
    }catch (e) {
        console.error(e.message)
    }
})
