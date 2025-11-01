// src/pages/Home.tsx
import { CloudUpload, Dashboard as DashboardIcon, ExpandMore, Logout, School, Settings } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useAuthStore } from "../stores/authStore";

export const Home: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [examForm, setExamForm] = useState({
    subject: "Toan",
    grade: "",
    questionCount: 4,
    difficulty: "thông hiểu",
  });

  const subjects = [
    { value: "Toan", label: "Toán học" },
    { value: "Li", label: "Vật lí" },
    { value: "Hoa", label: "Hóa học" },
    { value: "Sinh", label: "Sinh học" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExamForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = () => {
    alert("Generating exam with: " + JSON.stringify(examForm));
  };

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" sx={{ background: "linear-gradient(45deg, #1976d2, #42a5f5)" }}>
        <Toolbar>
          <School sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">AI-Exam Creator</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Tạo đề thi tự động với AI
            </Typography>
          </Box>
          <Avatar src={user?.avatar} sx={{ mr: 2 }} />
          <Typography sx={{ mr: 2, display: { xs: "none", sm: "block" } }}>{user?.firstName}</Typography>
          <IconButton color="inherit" onClick={logout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Controls */}
          <Grid item xs={12} lg={5}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                <DashboardIcon sx={{ mr: 1 }} />
                Cấu hình đề thi
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField select fullWidth label="Môn học" name="subject" value={examForm.subject} onChange={handleInputChange}>
                    {subjects.map((subject) => (
                      <MenuItem key={subject.value} value={subject.value}>
                        {subject.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField select fullWidth label="Lớp" name="grade" value={examForm.grade} onChange={handleInputChange}>
                    <MenuItem value="10">Lớp 10</MenuItem>
                    <MenuItem value="11">Lớp 11</MenuItem>
                    <MenuItem value="12">Lớp 12</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Số câu hỏi"
                    name="questionCount"
                    type="number"
                    value={examForm.questionCount}
                    onChange={handleInputChange}
                    inputProps={{ min: 1, max: 50 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField select fullWidth label="Mức độ" name="difficulty" value={examForm.difficulty} onChange={handleInputChange}>
                    <MenuItem value="nhận biết">Nhận biết</MenuItem>
                    <MenuItem value="thông hiểu">Thông hiểu</MenuItem>
                    <MenuItem value="vận dụng">Vận dụng</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            {/* Advanced Options */}
            <Accordion sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Settings sx={{ mr: 1 }} />
                <Typography>Tùy chọn nâng cao</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField fullWidth label="Tên đề thi" placeholder="VD: Kiểm tra 15 phút - Chương 1" sx={{ mb: 2 }} />
                <Button variant="outlined" component="label" startIcon={<CloudUpload />} fullWidth>
                  Tải lên tài liệu
                  <input type="file" hidden multiple />
                </Button>
              </AccordionDetails>
            </Accordion>

            {/* Generate Button */}
            <Button variant="contained" color="success" size="large" fullWidth onClick={handleGenerate}>
              🎯 Tạo đề thi
            </Button>
          </Grid>

          {/* Preview */}
          <Grid item xs={12} lg={7}>
            <Paper sx={{ p: 3, minHeight: 400 }}>
              <Typography variant="h6" gutterBottom>
                📊 Xem trước ma trận
              </Typography>
              <Box
                sx={{
                  border: "2px dashed",
                  borderColor: "grey.300",
                  borderRadius: 2,
                  p: 8,
                  textAlign: "center",
                  color: "text.secondary",
                }}
              >
                <Typography variant="h4" gutterBottom>
                  📋
                </Typography>
                <Typography variant="h6">Ma trận đề thi</Typography>
                <Typography variant="body2">Sẽ hiển thị sau khi cấu hình</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
