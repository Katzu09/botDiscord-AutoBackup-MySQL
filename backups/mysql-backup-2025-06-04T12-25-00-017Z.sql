/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: products
# ------------------------------------------------------------

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: transactions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `total_price` decimal(10, 2) NOT NULL,
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: products
# ------------------------------------------------------------

INSERT INTO
  `products` (`id`, `name`, `price`, `stock`, `created_at`)
VALUES
  (
    1,
    'Laptop Gaming',
    15000000.00,
    10,
    '2025-06-04 19:11:19'
  );
INSERT INTO
  `products` (`id`, `name`, `price`, `stock`, `created_at`)
VALUES
  (2, 'Mouse RGB', 250000.00, 50, '2025-06-04 19:11:19');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: transactions
# ------------------------------------------------------------

INSERT INTO
  `transactions` (
    `id`,
    `user_id`,
    `product_id`,
    `quantity`,
    `total_price`,
    `transaction_date`
  )
VALUES
  (1, 1, 1, 1, 15000000.00, '2025-06-04 19:11:19');
INSERT INTO
  `transactions` (
    `id`,
    `user_id`,
    `product_id`,
    `quantity`,
    `total_price`,
    `transaction_date`
  )
VALUES
  (2, 2, 2, 2, 500000.00, '2025-06-04 19:11:19');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: users
# ------------------------------------------------------------

INSERT INTO
  `users` (`id`, `username`, `email`, `password`, `created_at`)
VALUES
  (
    1,
    'gilang',
    'gilang@example.com',
    'password123',
    '2025-06-04 19:11:19'
  );
INSERT INTO
  `users` (`id`, `username`, `email`, `password`, `created_at`)
VALUES
  (
    2,
    'rina',
    'rina@example.com',
    'password456',
    '2025-06-04 19:11:19'
  );

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
