# 1. Зайти в контейнер

sudo docker exec -it avro-service-gitlab-1 bash

# 2. Зайти в консоль gitlab-rails

gitlab-rails console -e production

# 3.1 Если есть пользователь

user = User.where(id: 1).first
user.password = 'SqsJuWGNfRwv'
user.password_confirmation = 'SqsJuWGNfRwv'
user.save

# 3.2 Если нет пользователя

user = User.new(username: 'root', email: 'root@example.com', name: 'Administrator', password: 'SqsJuWGNfRwv', password_confirmation: 'SqsJuWGNfRwv')
user.skip_confirmation! # Use it only if you wish user to be automatically confirmed. If skipped, user receives confirmation e-mail
user.admin = true
user.save!