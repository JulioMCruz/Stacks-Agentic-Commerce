;; Reputation Registry Contract
;; Tracks agent reputation scores and ratings

;; ============================================
;; Constants
;; ============================================
(define-constant ERR_NOT_OWNER (err u100))
(define-constant ERR_NOT_AUTHORIZED (err u101))
(define-constant ERR_AGENT_NOT_FOUND (err u102))
(define-constant ERR_INVALID_RATING (err u103))

;; ============================================
;; Data vars
;; ============================================
(define-data-var contract-owner principal tx-sender)

;; ============================================
;; Maps
;; ============================================
;; Agent reputation scores
(define-map agent-reputation principal {
  total-score: uint,
  rating-count: uint,
  average-score: uint,
  completed-jobs: uint,
  disputed-jobs: uint
})

;; Individual ratings (prevent double rating)
(define-map ratings { agent: principal, rater: principal } {
  score: uint,
  job-id: uint,
  comment: (string-ascii 256)
})

;; Protocol callers (authorized to update reputation)
(define-map protocol-callers principal bool)

;; ============================================
;; Private functions
;; ============================================
(define-private (is-owner (caller principal))
  (is-eq caller (var-get contract-owner))
)

(define-private (is-protocol-caller (caller principal))
  (default-to false (map-get? protocol-callers caller))
)

(define-private (calculate-average (total uint) (count uint))
  (if (is-eq count u0)
    u0
    (/ total count)
  )
)

;; ============================================
;; Read-only functions
;; ============================================
(define-read-only (get-reputation (agent principal))
  (match (map-get? agent-reputation agent)
    rep (ok rep)
    (ok {
      total-score: u0,
      rating-count: u0,
      average-score: u0,
      completed-jobs: u0,
      disputed-jobs: u0
    })
  )
)

(define-read-only (get-rating (agent principal) (rater principal))
  (match (map-get? ratings { agent: agent, rater: rater })
    rating (ok rating)
    (err u404)
  )
)

(define-read-only (has-rated (agent principal) (rater principal))
  (is-some (map-get? ratings { agent: agent, rater: rater }))
)

;; ============================================
;; Public functions - Access control
;; ============================================
(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-owner tx-sender) ERR_NOT_OWNER)
    (var-set contract-owner new-owner)
    (ok true)
  )
)

(define-public (add-protocol-caller (caller principal))
  (begin
    (asserts! (is-owner tx-sender) ERR_NOT_OWNER)
    (map-set protocol-callers caller true)
    (ok true)
  )
)

;; ============================================
;; Public functions - Reputation
;; ============================================
(define-public (rate-agent
    (agent principal)
    (score uint)
    (job-id uint)
    (comment (string-ascii 256))
  )
  (let
    (
      (current-rep (default-to {
        total-score: u0,
        rating-count: u0,
        average-score: u0,
        completed-jobs: u0,
        disputed-jobs: u0
      } (map-get? agent-reputation agent)))
    )
    ;; Validate score (1-5)
    (asserts! (and (>= score u1) (<= score u5)) ERR_INVALID_RATING)
    
    ;; Prevent self-rating
    (asserts! (not (is-eq agent tx-sender)) ERR_NOT_AUTHORIZED)
    
    ;; Update rating record
    (map-set ratings { agent: agent, rater: tx-sender } {
      score: score,
      job-id: job-id,
      comment: comment
    })
    
    ;; Update reputation
    (let
      (
        (new-total (+ (get total-score current-rep) score))
        (new-count (+ (get rating-count current-rep) u1))
        (new-avg (calculate-average new-total new-count))
      )
      (map-set agent-reputation agent {
        total-score: new-total,
        rating-count: new-count,
        average-score: new-avg,
        completed-jobs: (get completed-jobs current-rep),
        disputed-jobs: (get disputed-jobs current-rep)
      })
    )
    
    (ok true)
  )
)

(define-public (update-job-stats
    (agent principal)
    (completed bool)
    (disputed bool)
  )
  (begin
    (asserts! (is-protocol-caller tx-sender) ERR_NOT_AUTHORIZED)
    
    (let
      (
        (current-rep (default-to {
          total-score: u0,
          rating-count: u0,
          average-score: u0,
          completed-jobs: u0,
          disputed-jobs: u0
        } (map-get? agent-reputation agent)))
      )
      (map-set agent-reputation agent {
        total-score: (get total-score current-rep),
        rating-count: (get rating-count current-rep),
        average-score: (get average-score current-rep),
        completed-jobs: (+ (get completed-jobs current-rep) (if completed u1 u0)),
        disputed-jobs: (+ (get disputed-jobs current-rep) (if disputed u1 u0))
      })
    )
    
    (ok true)
  )
)
