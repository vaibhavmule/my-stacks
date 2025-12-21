;; title: daily-checkin
;; version: 1.0.0
;; summary: Daily check-in contract using Clarity 4 features
;; description: Users can check in once per day. Tracks streaks and check-in history.

;; constants
(define-constant CONTRACT_OWNER tx-sender)

(define-constant ERR_ALREADY_CHECKED_IN (err u1001))
(define-constant ERR_INVALID_USER (err u1002))

;; data vars
(define-data-var total-checkins uint u0)

;; data maps
;; Track last check-in day per user (principal -> burn-block-height)
(define-map last-checkin-day
  { user: principal }
  uint
)

;; Track user's current streak (principal -> streak count)
(define-map user-streak
  { user: principal }
  uint
)

;; Track total check-ins per user (principal -> count)
(define-map user-total-checkins
  { user: principal }
  uint
)

;; Store check-in history (user + day -> true)
(define-map checkin-history
  { user: principal, day: uint }
  bool
)

;; public functions
;; Check in for the current day
(define-public (check-in)
  (let ((user contract-caller)
        (current-day burn-block-height)
        (last-day (default-to u0 (map-get? last-checkin-day { user: user }))))
    ;; Check if user already checked in today
    (asserts! (is-eq current-day last-day) ERR_ALREADY_CHECKED_IN)
    
    ;; Calculate streak
    (let ((current-streak (default-to u0 (map-get? user-streak { user: user })))
          (new-streak (if (or (is-eq current-streak u0) (is-eq (- current-day last-day) u1))
                        (+ current-streak u1)
                        u1)))
      ;; Update last check-in day
      (map-set last-checkin-day { user: user } current-day)
      
      ;; Update streak
      (map-set user-streak { user: user } new-streak)
      
      ;; Update total check-ins for user
      (let ((user-total (default-to u0 (map-get? user-total-checkins { user: user }))))
        (map-set user-total-checkins { user: user } (+ user-total u1)))
      
      ;; Update global total
      (var-set total-checkins (+ (var-get total-checkins) u1))
      
      ;; Record in history
      (map-set checkin-history { user: user, day: current-day } true)
      
      ;; Emit event
      (print {
        event: "daily-checkin",
        user: user,
        day: current-day,
        streak: new-streak,
        total: (+ (default-to u0 (map-get? user-total-checkins { user: user })) u1)
      })
      
      (ok new-streak)
    )
  )
)

;; read only functions
;; Check if user has checked in today
(define-read-only (has-checked-in-today (user principal))
  (let ((last-day (default-to u0 (map-get? last-checkin-day { user: user }))))
    (ok (is-eq last-day burn-block-height))
  )
)

;; Get user's current streak
(define-read-only (get-user-streak (user principal))
  (ok (default-to u0 (map-get? user-streak { user: user })))
)

;; Get user's total check-ins
(define-read-only (get-user-total-checkins (user principal))
  (ok (default-to u0 (map-get? user-total-checkins { user: user })))
)

;; Get last check-in day for a user
(define-read-only (get-last-checkin-day (user principal))
  (ok (default-to u0 (map-get? last-checkin-day { user: user })))
)

;; Get total check-ins across all users
(define-read-only (get-total-checkins)
  (ok (var-get total-checkins))
)

;; Check if user checked in on a specific day
(define-read-only (checked-in-on-day (user principal) (day uint))
  (ok (default-to false (map-get? checkin-history { user: user, day: day })))
)

;; Get current burn block height (for reference)
(define-read-only (get-current-day)
  (ok burn-block-height)
)

;; Clarity 4 feature: Get contract hash (contract-hash?)
(define-read-only (get-contract-hash (contract-principal principal))
  (contract-hash? contract-principal)
)

;; Clarity 4 feature: Verify contract hash
(define-read-only (verify-contract-hash (contract-principal principal) (expected-hash (buff 32)))
  (let ((contract-hash-result (contract-hash? contract-principal)))
    (match contract-hash-result
      hash (ok (is-eq hash expected-hash))
      err-code (ok false)
    )
  )
)
