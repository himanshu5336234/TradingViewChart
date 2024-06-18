import axiosApiWithServer from './axiosApiWithServer.js';

const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});

const token = params?.token;

const save_load_adapter= {
    study_templates : [],
    getAllCharts: async function() {

        if(!token) return; 
        try{
        const {data} = await axiosApiWithServer({
            url:`/v1/charts`, 
            method:'get',
            headers: JSON.stringify({ accept: "*/*" })
            
        })
        return Promise.resolve(data || [])
        
        
    }
        catch(er){
            
            return Promise.reject(er)
        }
    

    },

    removeChart: async function(id) {
        if(!token) return; 

        try{
            const {status} = await axiosApiWithServer({
                url:`/v1/charts?id=${id}`,
                method:'delete'
            })

            return Promise.resolve("success")
            
            }
            catch(err){
                
                return Promise.reject("failed")
            }
        
    },

    saveChart: async function(chartData) {

        if(!token) return; 
        
                
        try{
            // if(chartData.id) {
            //     this.removeChart(chartData.id);
            // }
            const res = await axiosApiWithServer({
                url:`/v1/charts`,
                method: 'post', 
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                body: chartData,
                isMultiPartData:true
            })
            
            const {data} = res;
            return Promise.resolve(data.id)
            
            
        }
        catch(err){
            
            return Promise.reject("failed")
        }
    },

    getChartContent: async function(id) {
        if(!token) return; 
        
        try{

            const {status,data} = await axiosApiWithServer({
            url:`/v1/charts?id=${id}`, 
            method:'get'})
            
            return Promise.resolve(data.content)
            
            
        }
            catch(er){
                return Promise.reject(er)
            }
        
    },

    removeStudyTemplate: async function(studyTemplateData) {
        if(!token) return; 
        
        let template = this.study_templates.find(item => item.name === studyTemplateData.name);
        let  id = template?.id;
        
        try{
            const {status} = await axiosApiWithServer({
                url:`/v1/study-templates?id=${id}`,
                method:'delete'
            })

            return Promise.resolve("success")
            
        }
        catch{
        return Promise.reject();
        }
    },

    getStudyTemplateContent: async function(studyTemplateData) {
        if(!token) return; 
        
        let template = this.study_templates.find(item => item.name === studyTemplateData.name);
        try{
            const {data,status} = await axiosApiWithServer({
                url:`/v1/study-templates?id=${template.id}`,
                method: 'get'
            })
            return Promise.resolve(data.content);
        }
            catch(er){
                return Promise.reject(er)
            }
    },

    saveStudyTemplate: async function(studyTemplateData) {
        if(!token) return; 
        
        let isTemplate = this.study_templates.find(item => item.name === studyTemplateData.name);
        // if(isTemplate){
        //     this.removeStudyTemplate(isTemplate);
        // }
        try{
        const {data, status} = await axiosApiWithServer({
             url:`/v1/study-templates`,
             body:studyTemplateData , 
             headers: {
            'Content-Type': 'multipart/form-data'
              },
            method:'post',
            isMultiPartData: true


        }
          )
        return Promise.resolve(data.id)
        
        }
        catch(err){
            
            return Promise.reject("failed")
        }
    }, 

    getAllStudyTemplates: async function() {
        if(!token) return; 
        
 
        try{
            const {data, status} = await axiosApiWithServer({
                url:`/v1/study-templates`,
                method:'get'
            })
            
            this.study_templates= data || [];
            return Promise.resolve(data || [])
        }
            catch(er){
                return Promise.reject(er)
            }
        
    }
}

export default save_load_adapter