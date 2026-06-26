;; Agent Registry Contract
;; Implementa identidad de agentes on-chain (port de ERC-8004 Identity a Stacks)

(define-data-var agents (list 100 (tuple (name string-64) (description string-256) (creator principal) (wallet principal) (active bool) (endpoints (list 10 (tuple (name string-32) (url string-128)))))))

(define-data-var agent-counter uint u0)

(define-public (register-agent (name string-64) (description string-256) (wallet principal) (endpoints (list 10 (tuple (name string-32) (url string-128))))))
  (begin
    (print u"registering new agent")
    (var-set agent-counter (+ (var-get agent-counter) u1))
    (var-set agents (append (var-get agents) (list (tuple (name name) (description description) (creator tx-sender) (wallet wallet) (active true) (endpoints endpoints)))))
    (ok (var-get agent-counter))
  )
)

(define-read-only (get-agent (agent-id uint)))
  (match (list-nth? (var-get agents) agent-id) 
    agent (ok agent) 
    err (err u1)
  )
)

(define-read-only (agent-count))
  (ok (len (var-get agents)))
)

(define-public (update-agent (agent-id uint) (new-name (optional string-64)) (new-description (optional string-256)) (new-wallet (optional principal))))
  (match (list-nth? (var-get agents) agent-id)
    agent
    (begin
      (asserts (is-eq (get creator agent) tx-sender) (err u2)) ;; solo owner
      (var-set agents (list-set (var-get agents) agent-id (tuple 
        (name (default-to (get name agent) new-name))
        (description (default-to (get description agent) new-description))
        (creator (get creator agent))
        (wallet (default-to (get wallet agent) new-wallet))
        (active (get active agent))
        (endpoints (get endpoints agent))
      )))
      (ok true)
    )
    err (err u1)
  )
)

(define-public (deactivate-agent (agent-id uint)))
  (match (list-nth? (var-get agents) agent-id)
    agent
    (begin
      (asserts (is-eq (get creator agent) tx-sender) (err u2)) ;; solo owner
      (var-set agents (list-set (var-get agents) agent-id (tuple 
        (name (get name agent))
        (description (get description agent))
        (creator (get creator agent))
        (wallet (get wallet agent))
        (active false)
        (endpoints (get endpoints agent))
      )))
      (ok true)
    )
    err (err u1)
  )
)
