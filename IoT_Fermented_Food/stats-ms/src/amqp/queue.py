import json

from amqp.rabbitmq import get_channel

class Queue():
    def __init__(self, controller):
        channel = get_channel()
        
        # DLQ Configuration
        dlx = 'dlx'
        dlq = 'dead-messages'
        channel.exchange_declare(exchange=dlx, exchange_type='fanout', durable=True)
        channel.queue_declare(queue=dlq, durable=True)
        channel.queue_bind(queue=dlq, exchange=dlx)

        channel.queue_declare(queue=controller.queue, durable=True, arguments={
            'x-dead-letter-exchange': dlx
        })
        streams = { }

        def queue_callback(ch, method, properties, body):
            try:
                data = json.loads(body.decode())
                key = f"{data['username']}_{data['ip']}"
                stream = streams.get(key)
                print(data, len(stream) if stream is not None else 0)

                if stream is not None:
                    stream.append(data)

                    if len(stream) >= controller.max_items:
                        stats = controller.calculate_stats(stream.copy())
                        stream.clear()
                        print(f'{stats}')
                        print(f'************{key}************')
                        print(f'------------{streams.keys()}------------')
                        controller.dao.insert_document(stats)
                else:
                    streams[key] = [ data ]
                
                ch.basic_ack(delivery_tag=method.delivery_tag)
            except Exception as e:
                print(f'Error processing message in stats-ms: {str(e)}')
                # Nack without requeue moves to DLX
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

        channel.basic_consume(queue=controller.queue, auto_ack=False, on_message_callback=queue_callback)
        channel.start_consuming()
