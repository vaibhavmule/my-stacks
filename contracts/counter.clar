;; title: counter
;; version: 1.0.0
;; summary: A simple counter contract using Clarity 4 features
;; description: Demonstrates stacks-block-time and to-ascii? from Clarity 4

;; data vars
(define-data-var count uint u0)

;; public functions
(define-public (increment)
  (begin
    (var-set count (+ (var-get count) u1))
    (ok (var-get count))
  )
)

(define-public (decrement)
  (begin
    (let ((current (var-get count)))
      (if (> current u0)
        (begin
          (var-set count (- current u1))
          (ok (var-get count))
        )
        (err u1)
      )
    )
  )
)

;; read only functions
(define-read-only (get-count)
  (ok (var-get count))
)

;; Clarity 4 feature: Get count as ASCII string
(define-read-only (get-count-as-string)
  (ok (to-ascii? (var-get count)))
)

;; Clarity 4 feature: Get timestamp when count was last updated
(define-read-only (get-current-time)
  (ok stacks-block-time)
)
