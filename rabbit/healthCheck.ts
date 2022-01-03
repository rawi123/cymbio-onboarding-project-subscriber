const healthCheckRabbitMq = require('health-check-rabbitmq');
const rabbitHealthCheck = async():Promise<boolean> => {
    try {
        const res=await healthCheckRabbitMq.do([
            {
                host: '127.0.0.1',
                port: 5672
            },
            {
                host: 'wrong host',
                port: 5672
            }])
        return res.health;
    }
    catch(err){
        return false;
    }

}
export default rabbitHealthCheck;