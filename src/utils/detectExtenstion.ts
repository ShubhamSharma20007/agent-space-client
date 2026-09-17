export function detectExtension(fileName:string){
    if(fileName.endsWith('.html')){
        return 'html'
    }else if(fileName.endsWith('.css')){
        return 'css'
    }else if(fileName.endsWith('.js')){
        return 'javascript'
    }else if(fileName.endsWith('.ts')){
        return 'typescript'
    }else if(fileName.endsWith('.json')){
        return 'json'
    }else if(fileName.endsWith('.py')){
        return 'python'
    }else if(fileName.endsWith('.java')){
        return 'java'
    }else if(fileName.endsWith('.c')){
        return 'c'
    }else{
        return 'plaintext'
    }
}