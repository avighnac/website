On 'what does this represent'... and related thoughts

When we are solving problems, we often deal with and employ the usage of complicated 'structures', with multiple abstraction layers stacked together. And, of course, the good problem solvers we are, we wish to understand and interpret meaningfully the meaning of everything present in our solution... or... do we?

Let me tell you a story about a time when I was explaining a problem to one of my friends. It was on LeetCode: https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/description/. The statement is short: you're given $n$ and and array $a[]$ of length $n$, and you must return the length of the shortest non-empty subarray that has a sum that is at least $k$.

There are easier solutions, but my first thought was to construct a prefix sum array and then rewrite the condition as $p[j] - p[i] \ge k$, minimizing $j-i$. Then, for a fixed $i$, we notice that we require only these two conditions to be true:

$$
1. j > i
2. p[j] \ge k + p[i]
$$

My solution was then to use a segement tree where indices stored values of $p[]$ (so that a range query from $k+p[i]$ to $\infty$ would enforce the second condition), while reverse looping and adding at the end of the loop body to enforce the first condition (code: https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/submissions/2160666808).

---

Pretty; simple, right?

However, my friend was still confused. She then proceeded to ask me a question which took me by surprise: what does the segment tree represent?

...

I hadn't really thought about that. So I did think about it. After a few minutes, I figured out that in this case, the segemnt tree was really the 'inverse prefix sum' array. That is, if $P[a] = b$, then $st[b] = a$. Since $P$ is not bijective (and is, in fact, one to many), $st[b] = min{a}$ such that $P[a] = b$.

This made me realise two things. 1: I didn't know what the segment tree represented until I was made to think about it, and 2: Understanding what the segment tree represented quite literally contributed nothing towards understanding how my solution worked.

So this is an interesting phenomenon. It actually goes against fundamental wisdom—wisdom that I myself preach—that you must understand everything you use before actually using it: the so-called 'pure' way of doing things.

Before interpreting this further, let me tell you about what motivated me to write this blog. Two weeks after this incident, I found myself attempting the (https://atcoder.jp/contests/aalc001) AtCoder segment tree contest (fun contest, by the way, would recommend). One of the questions required that I make a lazy segement tree that supports the following operations:

1. Given l, r, and t, perform A[i] += R[i]*t for l <= i <= r
2. Given l, r, t, perform R[i] += t for l <= i <= r

Here, $R[i]$ is the 'representative value' for position $i$. There are two operations, so I reached for a lazy type `F` that stored two numbers: `incr`, and `rep_incr` (for operations 1 and 2 respectively).

[recall box: collapsible]
A lazy segment tree works on two types: `T`: the data type and `F`: the lazy tag type. We must be able to compose two `T`'s (seg[v] = seg[2v] + seg[2v+1]), two `F`'s (to combine lazy tags), and define how `F` must be applied on `T` (pushing lazy[v] to seg[v]).
[recall box end]

To apply `F` to `T`, which is just `(int, int)` (sum of values, sum of representatives) in this case, I chose to apply `incr` first, then `rep_incr` (this choice is arbitrary). Composing two `T`s is just regular pairwise integer addition. The only part remaining to figure out was how to compose two `F`s.

If T = (A, B) and F = (u, v), then applying F to T on a segment of length L gives T' = (A + uB, B + vL). If we  then try to apply F1 = (u1, v1) and F2 = (u2, v2) in order, we get T' = (A + (u1+u2) B + u2v1 L, B + (v1+v2) L). We can see that the composition is *almost* possible, but it's not right now, because of u2v1 L.

At this point, I just decided to add another term `w` to my lazy tag, redefining my update as T' = (A + uB + wL, B + vL). With this change, applying F1 = (u1,v1,w1) and F2 = (u2,v2,w2) gives T' = (A + (u1+u2)B + (w1+w2+u2v1)L, B + (v1+v2)L). This does compose: F1 and then F2 can be represented by the single operation F' = (u1+u2, v1+v2, w1+w2+u2v1)!

Great, so we've solved our problem. It was now time to code this up. I had chosen nice names for `u` and `v`: `incr` and `rep_incr` respectively. `incr` means the increment A[i]+=t*R[i], and `rep_incr` means the increment R[i]+=t. But I had to add another variable to the lazy tag: what do I name it? I decided go with `w`.

I proceeded to code this up and solve the problem (which was O - Minimum Value https://atcoder.jp/contests/aalc001/submissions/80032824). Later, satisfied with my successful submission, I looked at the code again. Everything was clean and I understood all of the algebra that was going on.

I looked at my lazy type again and chuckled at the absurd difference between the names `incr`, `rep_incr` and `w`. How very competitive programmer of me to give a random, unhelpful name to a variable, I thought. But then I paused and looked at the name once again. `w`. Hmm. What is `w`? What does `w` *represent*?

---

What was common among these two examples? Both were examples of a problem successfully being solved without the *need* to interpret the meaning of some quantities. However, the diligent reader may also notice a difference. If we think about what `w` really represents, we **can** eventually realise that it's simply range addition: A[i] += t! So our lazy segment tree actually supports *three* operations instead of just two:

1. Given l, r, and t, perform A[i] += R[i]*t for l <= i <= r
2. Given l, r, t, perform R[i] += t for l <= i <= r
3. Given l, r, and t, perform A[i] += t for l <= i <= r

A motivated problem solver would also be able to take their time to realise that just operations 1 and 2 are not closed under composition, but operations 1,2, and 3 are. When you apply operation 1 after just having applied operation 2, you must add a constant increment equal to the difference between the previous and current representative values to each element in your range, and this is just an instance of operation 3.

I invented this explanation retroactively, but it is possible to have interpreted `w` as operation 3 while coming up with it. 

And that brings us to the core of it. We are often told that being a good problem solver means understanding every little detail about every tool that we're using. I claim that there are instances where asking what something does is actually a **bad question**!

What makes something a good question to ask while solving a problem? The question should shed light on something meaningful that helps us understand the process we're performing better. Sometimes, a question about what something represents is extremely helpful: asking what a DP state represents is a very good question because how can you even understand what's going on if you don't know what we're trying to calculate? Sometimes the question is neither good nor bad, as is the case with asking what `w` means in the lazy segment tree example. We could solve the whole problem without caring what `w` represented because the only role it served was to make `F` closed under composition. At the same time, `w` did end up carrying meaning that is fun to know, and maybe somewhat insightful. And sometimes, like in the very first example of this blog, the question about what the segment tree represents is actually a distraction from solving the problem! 

Before I wrap this blog up, there's another really popular paradigm where we construct a system, understanding exactly what we're doing as a whole, but none of the inner workings, specifically, questions about what something represents. This is, of course, AI models! A large language model processes tokens in several layers. We know, concretely, what the input to the first layer and the output of the last layer represent. There have been several attempts to, for bigger models, understand what it's doing in between. And, sometimes, these attempts have been successful. We may be able to abstract some dimension to mean something specific, like gender or age. But the model is not constrained to only classify things based on what humans can understand (one of its many strengths: we don't need to explicitly list out features!). It may invent its own dimensions which may combine multiple features together, in weird proportions, in such a way that if someone were to ask 'what does this layer's output represent' there may not be a great answer.

Despite this, AI models work wonderfully well. Maybe the ignorance of parameters and their meaning is not a curse or limitation, but a blessing in disguise that allows us to be better problem solvers.