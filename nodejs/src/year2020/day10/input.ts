export const rInput  = getRealRaw().split('\n').map(n=>Number(n))
export const tInput  = getTestRaw().split('\n').map(n=>Number(n))
function getTestRaw() {
    return `28
33
18
42
31
14
46
20
48
47
24
23
49
45
19
38
39
11
1
32
25
35
8
17
7
9
4
2
34
10
3`;
}
function getRealRaw() {
    return `54
91
137
156
31
70
143
51
50
18
1
149
129
151
95
148
41
144
7
125
155
14
114
108
57
118
147
24
25
73
26
8
115
44
12
47
106
120
132
121
35
105
60
9
6
65
111
133
38
138
101
126
39
78
92
53
119
136
154
140
52
15
90
30
40
64
67
139
76
32
98
113
80
13
104
86
27
61
157
79
122
59
150
89
158
107
77
112
5
83
58
21
2
66`
}