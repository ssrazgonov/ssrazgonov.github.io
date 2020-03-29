В нашем примере мы создадим CRUD (Create / Read / Update / Delete) приложение, для управления списком компаний.

![](assets/img/laravel-vue-crud.png)

**Необходимые зависимости**
1. PHP >= 7.2, (команда для проверки версии php -v )
2. composer пакетный менеджер для php библиотек
3. Node js >= 10.0, (команда для проверки версии node -v)
4. npm (устаналивается вместе с Node js) пакетный менеджер для js библиотек
5. субд Mysql/PostgreSQl

**Часть 1.1 Установка фрейморка laravel**

Установим последнюю версию через composer:
```shell script
composer require laravel/laravel
```

_**Все команды будут выполняться из директории созданного проекта!**_

После процесса установки проверим версию laravel:
```shell script
php artisan -V

Laravel Framework 7.3.0
```

**Часть 1.2 первоначальная настройка.**

При установки laravel через composer, автоматически создался файл .env в корне проекта, если это не так, то, необходимо
создать его вручную

Что необходимо проверить в .env

- Параметр APP_KEY, он должен равнятся случайно сгенерированной строке, это защитный ключ приложения.
    - Если параметр пуст то выполнить
    ```shell script
    php artisan key:generate
    ```
- Настройки подключение базы данных:
    - Создайте пустую базу данных любым удобным вам способом (HeidiSQL, phpmyadmin, workbench, cli)
    - Пример:
    ```apacheconfig
    DB_CONNECTION=mysql # драйвер
    DB_HOST=127.0.0.1 # адрес
    DB_PORT=3306 # порт
    DB_DATABASE=laravel # имя БД
    DB_USERNAME=root # login
    DB_PASSWORD= # pass
    ```
  
Остальные настройки можно оставить по умолчанию.

Для проверки работоспособности базы данных выполните:

```shell script
php artisan migrate

# Вывод результата:
Migration table created successfully.
Migrating: 2014_10_12_000000_create_users_table
Migrated:  2014_10_12_000000_create_users_table (0.49 seconds)
Migrating: 2019_08_19_000000_create_failed_jobs_table
Migrated:  2019_08_19_000000_create_failed_jobs_table (0.22 seconds)

```

Это действие создаст необходимые таблицы для работы, все миграции расположены в директории:
```shell script
/database/migrations
```

Для дальнейшей работы нам понадобится таблица companies и модель данных.
Создать и модель и миграцию:

```shell script
php artisan make:model Company -m

# Model created successfully.
# Created Migration: 2020_03_29_110517_create_companies_table

```


Данная команда создала файл Company.php

<details>
    <summary>Код Company.php</summary>
    <p>
    
```php

<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    //
}
```
    
    </p>
</details>  