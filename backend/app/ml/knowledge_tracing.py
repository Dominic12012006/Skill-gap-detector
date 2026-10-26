from typing import List, Dict, Any, Tuple
import numpy as np

class BayesianKnowledgeTracing:
    """
    Standard Bayesian Knowledge Tracing (BKT) model for skill-level mastery estimation.
    Parameters:
      - p_init: Prior probability student already knows skill
      - p_transit: Probability of transitioning from unlearned to learned state at each step
      - p_slip: Probability student knows skill but slips (makes error)
      - p_guess: Probability student doesn't know skill but guesses correctly
    """
    def __init__(
        self,
        p_init: float = 0.30,
        p_transit: float = 0.15,
        p_slip: float = 0.10,
        p_guess: float = 0.20
    ):
        self.p_init = p_init
        self.p_transit = p_transit
        self.p_slip = p_slip
        self.p_guess = p_guess

    def update(self, p_known: float, is_correct: bool) -> float:
        """Applies Bayes rule conditioned on observation, then adds transit."""
        if is_correct:
            numerator = p_known * (1.0 - self.p_slip)
            denominator = numerator + (1.0 - p_known) * self.p_guess
        else:
            numerator = p_known * self.p_slip
            denominator = numerator + (1.0 - p_known) * (1.0 - self.p_guess)

        if denominator <= 0:
            p_obs = p_known
        else:
            p_obs = numerator / denominator

        # Transition to learned
        p_next = p_obs + (1.0 - p_obs) * self.p_transit
        return float(np.clip(p_next, 0.0, 1.0))

    def trace_sequence(self, observations: List[bool]) -> List[float]:
        """Traces mastery trajectory across a sequence of student answers."""
        trajectory = []
        p_current = self.p_init
        for obs in observations:
            p_current = self.update(p_current, obs)
            trajectory.append(round(p_current, 4))
        return trajectory

    def predict_next_correct_prob(self, p_known: float) -> float:
        """Computes probability of answering the next question correctly: P(C) = P(L)(1-S) + (1-P(L))G."""
        return float(p_known * (1.0 - self.p_slip) + (1.0 - p_known) * self.p_guess)

